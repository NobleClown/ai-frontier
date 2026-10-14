"""Render fixed local cards and local TTS into a <=179-second review sample."""
import argparse, json, math, re, shutil, subprocess, wave
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W,H=1920,1080
BG='#f5f3eb'; INK='#213a30'; GREEN='#75856a'; MUTED='#647062'; ORANGE='#bd652f'
FONT=Path('C:/Windows/Fonts/msyh.ttc')
def font(size): return ImageFont.truetype(str(FONT),size)
def wrap(text,f,max_width):
    lines=[]; current=''
    for ch in text:
        if ch=='\n' or (current and f.getlength(current+ch)>max_width):
            lines.append(current);current='' if ch=='\n' else ch
        else: current+=ch
    if current:lines.append(current)
    return lines
def text(d,value,xy,size=38,width=1550,color=INK,gap=14):
    x,y=xy
    for line in wrap(value,font(size),width):d.text((x,y),line,font=font(size),fill=color);y+=size+gap
    return y
def illustration(d,kind):
    # Original diagram drawn by code; no borrowed screenshots or stock media.
    x,y=1490,355
    if kind=='globe':
        d.ellipse((x-30,y,x+230,y+260),outline=GREEN,width=6)
        for offset in [35,90]:d.ellipse((x+offset,y,x+200-offset,y+260),outline=GREEN,width=3)
        for yy in [y+75,y+130,y+185]:d.line((x-15,yy,x+215,yy),fill=GREEN,width=3)
    elif kind=='voice':
        for i in range(15):
            height=int(30+90*abs(math.sin(i*.7)));xx=x+i*15
            d.rounded_rectangle((xx,y+140-height,xx+7,y+140+height),radius=3,fill=GREEN)
    elif kind in ['agents','chart']:
        for i in range(3):
            xx=x+i*72;hh=80+i*58
            d.rounded_rectangle((xx,y+250-hh,xx+45,y+250),radius=9,fill=GREEN)
        d.line((x-15,y+270,x+240,y+270),fill=INK,width=3)
    else:
        d.rounded_rectangle((x-20,y+20,x+240,y+245),radius=20,outline=GREEN,width=5)
        for i,ln in enumerate([160,125,175,100]):d.line((x+15,y+70+i*37,x+15+ln,y+70+i*37),fill=GREEN,width=7)
    text(d,'用途示意 · 非软件截图',(1440,670),24,370,MUTED)
def card(scene,date,index,count,directory):
    img=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(img)
    d.rectangle((0,0,W,12),fill=INK)
    text(d,'前 / AI 前沿',(100,55),40)
    text(d,'AI 生成配音与摘要',(1370,65),28,450,MUTED)
    d.line((100,130,1820,130),fill=GREEN,width=2)
    text(d,scene['section'],(100,170),26,1600,ORANGE)
    end=text(d,scene['heading'],(100,235),60,1260,INK,16)
    y=max(390,end+45)
    for line in scene['lines']:
        d.ellipse((102,y+14,114,y+26),fill=ORANGE)
        y=text(d,line,(140,y),36,1180,INK,12)+24
    if y>860:raise ValueError('Card text exceeds safe area: '+scene['id'])
    illustration(d,scene.get('icon','docs'))
    d.line((100,895,1820,895),fill=GREEN,width=2)
    text(d,scene.get('repository') or scene.get('source') or 'AI 前沿 · 独立资讯',(100,920),24,1250,MUTED)
    text(d,('原文 / 快照 '+scene['sourceDate']) if scene.get('sourceDate') else date,(100,960),22,1400,MUTED)
    text(d,f'{index+1:02d} / {count:02d}',(1670,960),25,220,MUTED)
    destination=directory/(scene['id']+'.png');img.save(destination);return destination
def stamp(seconds):
    value=int(round(seconds*1000));return f'{value//3600000:02d}:{value//60000%60:02d}:{value//1000%60:02d},{value%1000:03d}'
def ass_stamp(seconds):
    value=int(round(seconds*100));return f'{value//360000}:{value//6000%60:02d}:{value//100%60:02d}.{value%100:02d}'
def run(args,**kwargs):return subprocess.run(args,check=True,**kwargs)
def main():
    parser=argparse.ArgumentParser();parser.add_argument('plan');parser.add_argument('--rate',type=int,default=1);args=parser.parse_args()
    plan_path=Path(args.plan).resolve();out=plan_path.parent;plan=json.loads(plan_path.read_text(encoding='utf-8-sig'))
    frames=out/'frames';voices=out/'voices';frames.mkdir(exist_ok=True);voices.mkdir(exist_ok=True)
    speech=Path(__file__).with_name('speak.ps1')
    for rate in range(args.rate,5):
        run(['powershell.exe','-NoProfile','-File',str(speech),'-PlanPath',str(plan_path),'-OutputDirectory',str(voices),'-Rate',str(rate)])
        chunks=[];params=None
        for scene in plan['scenes']:
            with wave.open(str(voices/(scene['id']+'.wav')),'rb') as f:
                current=(f.getnchannels(),f.getsampwidth(),f.getframerate());data=f.readframes(f.getnframes());seconds=f.getnframes()/f.getframerate()
            if params and current!=params:raise ValueError('Voice format differs between scenes')
            params=current;chunks.append((scene,data,seconds,max(5.0,seconds+.35)))
        total=sum(chunk[3] for chunk in chunks)
        if total<=plan['maxDuration']:break
    if total>plan['maxDuration']:raise ValueError(f'Narration too long ({total:.1f}s); shorten script rather than cutting content')
    audio=out/'narration.wav';timeline=[];now=0;subtitles=[]
    with wave.open(str(audio),'wb') as f:
        f.setnchannels(params[0]);f.setsampwidth(params[1]);f.setframerate(params[2])
        for index,(scene,data,spoken,duration) in enumerate(chunks):
            image=card(scene,plan['date'],index,len(chunks),frames)
            f.writeframes(data);f.writeframes(b'\0'*int((duration-spoken)*params[2])*params[0]*params[1])
            timeline.append({'id':scene['id'],'start':now,'end':now+duration,'image':str(image.relative_to(out)).replace('\\','/')})
            fragments=wrap(scene['narration'],font(40),1650)
            cursor=now;length=sum(len(fragment) for fragment in fragments)
            for fragment in fragments:
                segment=spoken*len(fragment)/length
                subtitles.append((cursor,cursor+segment,fragment));cursor+=segment
            now+=duration
    (out/'subtitles.srt').write_text('\n\n'.join(f'{index+1}\n{stamp(start)} --> {stamp(end)}\n{line}' for index,(start,end,line) in enumerate(subtitles))+'\n',encoding='utf-8')
    header='[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Microsoft YaHei,40,&H00FFFFFF,&H00FFFFFF,&H00213A30,&H80213A30,0,0,0,0,100,100,0,0,3,2,0,2,100,100,18,1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
    (out/'subtitles.ass').write_text(header+'\n'.join(f'Dialogue: 0,{ass_stamp(start)},{ass_stamp(end)},Default,,0,0,0,,{line.replace(chr(10)," ")}' for start,end,line in subtitles)+'\n',encoding='utf-8-sig')
    (out/'frames.ffconcat').write_text('ffconcat version 1.0\n'+''.join(f"file '{item['image']}'\nduration {item['end']-item['start']:.6f}\n" for item in timeline)+f"file '{timeline[-1]['image']}'\n",encoding='utf-8')
    video=out/'ai-frontier-daily.mp4'
    run(['ffmpeg','-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i','frames.ffconcat','-i','narration.wav','-vf','fps=24,ass=subtitles.ass','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',f'{total:.3f}','-movflags','+faststart','-metadata',f'title=AI Frontier {plan["date"]}','-metadata',f'comment=AI-generated narration and editorial summary; publisher=AI Frontier; content_id=daily-video:{plan["date"]}; sources in accompanying description','ai-frontier-daily.mp4'],cwd=out)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)],text=True))
    actual=float(probe['format']['duration']);assert actual<180,actual
    assert any(s['codec_type']=='audio' for s in probe['streams'])
    cover=Image.open(frames/(plan['scenes'][0]['id']+'.png'));cover.save(out/'cover.png')
    (out/'render-report.json').write_text(json.dumps({'duration':actual,'resolution':[W,H],'voice':'Windows installed zh-CN voice','speechRate':rate,'scenes':timeline,'status':'local_review_sample','metadataNotice':'Custom provenance metadata; not a claim of GB 45438-2025 certification','autoPublished':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    run(['ffmpeg','-hide_banner','-loglevel','warning','-y','-ss',str(timeline[min(4,len(timeline)-1)]['start']+1),'-i',str(video),'-frames:v','1','-update','1',str(out/'render-check.png')])
    print(json.dumps({'video':str(video),'duration':actual,'speechRate':rate},ensure_ascii=False))
if __name__=='__main__':main()

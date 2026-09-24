from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

OUT=r'C:\Users\19708\Desktop\女性颜值类_1500x615高转化视觉规范_重制版.pdf'
REF=r'C:\Users\19708\Desktop\Group 4143.jpg'
W,H=960,594
PINK=HexColor('#FF6F9F'); HOT=HexColor('#EF3F79'); BLUSH=HexColor('#FFE8F0'); PAPER=HexColor('#F7F7F8'); INK=HexColor('#202124'); GREY=HexColor('#9A9AA1'); DARK=HexColor('#17171B')
pdfmetrics.registerFont(TTFont('Noto',r'C:\Windows\Fonts\NotoSansSC-VF.ttf'))
pdfmetrics.registerFont(TTFont('Arial',r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold',r'C:\Windows\Fonts\arialbd.ttf'))
def t(c,x,y,s,size=16,col=INK,b=False,fn='Noto'):
    c.setFillColor(col); c.setFont('ArialBold' if b else fn,size); c.drawString(x,y,s)
def box(c,x,y,w,h,fill=white,r=12,stroke=None):
    c.setFillColor(fill); c.roundRect(x,y,w,h,r,fill=1,stroke=0)
    if stroke: c.setStrokeColor(stroke); c.roundRect(x,y,w,h,r,fill=0,stroke=1)
def pill(c,x,y,w,label,fill=PINK):
    c.setFillColor(fill); c.roundRect(x,y,w,25,12,fill=1,stroke=0); t(c,x+10,y+7,label,10,white,True,'Arial')
def frame(c,title,sub,num):
    c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0); c.setFillColor(DARK); c.rect(0,H-74,W,74,fill=1,stroke=0)
    t(c,42,H-38,f'{num:02d}',24,PINK,True,'Arial'); t(c,105,H-36,title,23,white,True,'Arial'); t(c,105,H-58,sub,10,BLUSH,False,'Arial')
    t(c,42,24,'FEMALE BEAUTY-LED 1500 x 615 A+ SYSTEM',9,GREY,False,'Arial'); t(c,835,24,f'{num:02d} / 12',9,GREY,False,'Arial')
def wire(c,x,y,w,h,kind):
    box(c,x,y,w,h,white,10,HexColor('#D9D9DE')); c.setFillColor(BLUSH)
    if kind=='hero': c.roundRect(x+12,y+12,w*.56,h-24,8,fill=1,stroke=0); t(c,x+w*.63,y+h-45,'HERO / PRODUCT',18,INK,True,'Arial'); t(c,x+w*.63,y+h-75,'Title 56 px',12,GREY,False,'Arial'); pill(c,x+w*.63,y+35,105,'KEY BENEFIT')
    elif kind=='grid':
        for i in range(4):
            for j in range(2): box(c,x+12+i*205,y+12+j*87,190,75,BLUSH,7)
    else: c.roundRect(x+12,y+12,w*.48,h-24,8,fill=1,stroke=0); box(c,x+w*.53,y+12,w*.42,h-24,white,8,HexColor('#D9D9DE'))
c=canvas.Canvas(OUT,pagesize=(W,H))
c.setFillColor(DARK); c.rect(0,0,W,H,fill=1,stroke=0); t(c,54,475,'VISUAL SYSTEM 03',18,PINK,True,'Arial'); t(c,54,410,'女性颜值类',54,white,True); t(c,54,350,'1500 x 615 高转化视觉规范',32,BLUSH,True); t(c,54,310,'从视觉风格到运营策划的统一模块系统',16,GREY); c.setFillColor(PINK); c.rect(650,0,310,594,fill=1,stroke=0); c.setFillColor(BLUSH); c.circle(805,340,130,fill=1,stroke=0); t(c,730,330,'ONE',28,white,True,'Arial'); t(c,718,298,'MESSAGE',22,white,True,'Arial'); c.drawImage(ImageReader(REF),675,45,260,170,preserveAspectRatio=True,anchor='c',mask='auto'); c.showPage()
pages=[('视觉 DNA','STYLE DNA / WHAT USERS SHOULD FEEL','轻柔但不幼稚 · 产品第一 · 一图一结论'),('固定网格与安全区','FIXED MODULE / 1500 x 615 PX','横向安全区 60 px · 纵向安全区 45 px · 内容宽 1380 px'),('字体与层级','TYPE SCALE FOR 1500 x 615 PX','主标题 56 px · 副标题 28 px · 正文 22 px · 数据 42 px'),('色彩与影调','COLOR BALANCE / PRODUCT FIRST','品牌粉 #FF6F9F · 强调粉 #EF3F79 · 浅粉 #FFE8F0 · 背景灰 #F7F7F8 · 墨黑 #202124'),('按沟通目标选版式','CHOOSE BY COMMUNICATION GOAL','Hero=品牌认知 · Grid=卖点扫读 · Split=功能证明 · List=消除顾虑')]
for i,(a,b,d) in enumerate(pages,1):
    frame(c,a,b,i); box(c,48,160,864,300,white,14); t(c,75,390,d,24,INK,True); t(c,75,340,'设计执行',15,PINK,True); t(c,75,305,'使用统一间距、圆角、字号和粉色强调，避免每张图重新发明版式。',15,GREY); c.setFillColor(BLUSH); c.roundRect(560,205,270,150,12,fill=1,stroke=0); t(c,620,275,'PRODUCT',24,PINK,True,'Arial'); t(c,655,242,'FIRST',24,PINK,True,'Arial'); c.showPage()
mods=[('首屏主视觉','PRODUCT FIRST / 1 MESSAGE','hero','产品占 55–65%；标题=用户收益；道具≤3 件。'),('卖点矩阵','FEATURE GRID / FAST SCAN','grid','6–8 卡片；每卡=标题+细节图+证据。'),('连接模式','PROOF / REDUCE DOUBT','split','场景图 + 连接方式 + 系统兼容。'),('续航电池','DATA / REASSURANCE','split','大数字 42–56 px；最多 3 条数据。'),('灯效与软件','DEMO / SHOW CONTROL','split','一张图只展示一个动作或流程。'),('包装清单','IN THE BOX / COMPLETE','split','编号列表 + 俯拍实物，避免遗漏感。'),('售后信任','TRUST / CLOSE THE SALE','split','保修、响应时效、退换承诺固定尾图。')]
for n,(a,b,k,d) in enumerate(mods,6):
    frame(c,a,b,n); wire(c,48,250,864,210,k); t(c,48,205,'运营策划输入',15,PINK,True); t(c,48,170,d,15,INK); t(c,48,125,'验收：3 秒看懂主卖点 · 10 秒读完关键参数 · 移动端文字不糊',13,GREY); c.showPage()
c.save(); print(OUT)

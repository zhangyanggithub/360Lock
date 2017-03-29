/**
 * Created by 张洋 on 17-3-28.
 */

(function () {
    var Lock = function (options) {
        //m默认参数
        this.default = {
            parent:document.body,//将canvas添加到parent上
            width:250,//canvas的宽
            height:300,//canvas的高
            circleD:48 //canvas中小圆的直径
        };
        this.test = 0;
        this.oldPos = {x:'',y:''};
        this.startPos = {x:'',y:''};
        this.settings = {};
        this.canvas = null;
        this.contex = null;
        this.alreadyArr = [];//已经触摸的圆
        this.circleArr = [];//保存小圆的中心坐标
        this.successSet = false;
        this.phase = 0;
    //    初始化解锁面板
        this.init(options);
    };
    Lock.prototype = {
        init:function(options){
            this.alreadyArr = [];//已经触摸的圆
            this.leftArr = [];//未触摸的圆
            this.circleArr = [];
            var canvas = document.createElement('canvas'),
                settings = Object.assign({},this.default,options),
                cw = parseInt(settings.width),
                ch = parseInt(settings.height),
                cd = settings.circleD,
                i,
                j,
                x =0,
                y = 0;
            this.settings = settings;
            //设置画布大小并将其append到parent上
            canvas.setAttribute('width',cw+"px");
            canvas.setAttribute('height',ch+"px");
            canvas.setAttribute('style',"background-color:#F0F0F2");
            settings.parent.appendChild(canvas);
            //计算9个圆形区域的中心坐标
            for(i = 0;i<3;i++){
                for(j = 0;j<3;j++){
                    x = j*(cw/3)+cd;
                    y = i*(ch/3)+cd;
                    this.circleArr.push({x:x,y:y});
                    this.drawCircle(x,y,cd/2,'#FFF');
                }
            }
            this.leftArr = this.circleArr.slice(0);//初始化剩余未触摸圆
            this.touchStart();
        },
        //drawCircle画圆
        drawCircle:function (x,y,r,color) {
            var canvas = document.getElementsByTagName('canvas')[0],
                context = canvas.getContext('2d');
            this.contex = context;
            context.strokeStyle = '#D4D4D4';
            context.fillStyle = color;
            context.beginPath();
            context.arc(x,y,r,0,Math.PI*2,true);
            context.closePath();
            context.stroke();
            context.fill();
        },
        touchStart:function () {
            var canvas = document.getElementsByTagName('canvas')[0],
                that = this;
            myEvent.addHandler(canvas,'touchstart',function (e) {
                e.preventDefault();
                myEvent.addHandler(canvas,'touchmove',function (e) {
                    e = myEvent.getEvent(e);
                    e.preventDefault();
                    var coordinate = that.getCoordinate(e),//获取触摸点的位置
                        i = 0,
                        arr = that.circleArr,
                        len = arr.length;
                    for(;i<len;i++){//将离触摸点距离小于小圆半径的小圆圆形位置push到alreadyArr即已经触摸过的数组中
                        if(Math.abs(coordinate.x - arr[i].x) < that.settings.circleD/2 && Math.abs(coordinate.y - arr[i].y) < that.settings.circleD/2 ){
                            if(that.alreadyArr.indexOf(arr[i]) < 0){
                                that.alreadyArr.push(arr[i]);
                            }
                        }
                    }
                    // that.extendLine(that.alreadyArr,that.getCoordinate(e));
                    if(that.alreadyArr.length > 1){
                        that.drawPointLine(that.alreadyArr);
                    }
                });
            });
            this.touchEnd2();
        },
        extendLine:function (arr,pos) {
            this.test++;
            if(this.test == 10){
                console.log(10);
            }
            var arrCirPoint = [],
                len = 0,
                startPos = {};
            for(var i =0,j = arr.length; i<j; i++){
                if(Math.abs(pos.x - arr[i].x) < this.settings.circleD/2 && Math.abs(pos.y - arr[i].y) < this.settings.circleD/2 ){
                    this.startPos = {x:arr[i].x,y:arr[i].y};
                    break;
                }
            }
            if(this.oldPos.x != ''){
                this.drawLine( this.startPos.x, this.startPos.y, this.oldPos.x,this.oldPos.y,'#F0F0F2');
            }
            this.drawLine(startPos.x,startPos.y,pos.x,pos.y,'#E57679');
            this.oldPos.x = pos.x;
            this.oldPos.y = pos.y;
        },
        touchEnd2:function () {
            var that = this,
                alreadyLength,
                canvas = document.getElementsByTagName('canvas')[0],
                tip = document.getElementById('tip'),
                userValidate = document.getElementById('verifyS');
                userSet = document.getElementById('setS');
            myEvent.addHandler(canvas,'touchend',function (e) {
                e = myEvent.getEvent(e);
                e.preventDefault();
                alreadyLength = that.alreadyArr.slice(0).length;
                if(userValidate.checked){
                    that.phase = 2;
                }
                switch (that.phase){
                    case 0:{//设置密码时第一次输入
                        if(alreadyLength < 5){
                            tip.innerHTML = '密码太短，至少需要5个点！';
                            setTimeout(function () {
                                that.reflowCanvas();
                            },1000);
                            that.phase = 0;
                        }else{//密码大于4个圆，下一次便可验证密码，因此将secondInput = true
                           window.localStorage.zyCooridate = that.changeToStr(that.alreadyArr);
                            tip.innerHTML = '请再次输入手势密码';
                            that.secondInput = true;
                            that.reflowCanvas();
                            that.phase = 1;
                        }

                    } break;
                    case 1:{//请再次输入
                        if(window.localStorage.getItem('zyCooridate') ==  that.changeToStr(that.alreadyArr)){
                            tip.innerHTML = '密码设置成功！';
                            that.successSet = true;
                            that.reflowCanvas();
                            that.phase = 0;
                        }else{
                            tip.innerHTML = '两次输入的密码不一致，请重新设置密码！';
                            that.successSet = false;
                            that.reflowCanvas();
                            that.phase = 0;
                        }

                    } break;
                    default:break;
                    case 2:{//用户验证是否是上次保存的密码
                        if( that.successSet ){
                            if(window.localStorage.getItem('zyCooridate') ==  that.changeToStr(that.alreadyArr)){
                                tip.innerHTML = '密码正确！';
                                that.reflowCanvas();
                            }else{
                                tip.innerHTML = '输入的密码不正确，请再次输入！';
                                that.reflowCanvas();
                            }
                        }else{
                            tip.innerHTML = '无法验证，因为您上次未成功设置密码！请您先设置密码！';
                        }
                        that.phase = 0;
                    } break;
                    /*  case 3:{//请重新设置密码

                    } break;*/
                }
                //用户勾选了radio为验证密码的按钮
           /*     if(userValidate.checked){
                    if(window.localStorage.getItem('zyCooridate') ==  that.changeToStr(that.alreadyArr)){
                        tip.innerHTML = '密码正确！';
                        that.reflowCanvas();
                    }else{
                        tip.innerHTML = '输入的密码不正确，请再次输入！';
                        that.reflowCanvas();
                    }
                }
                //只有用户在再次输入手势密码后that.secondInput才为true
                if(that.secondInput){
                    if(window.localStorage.getItem('zyCooridate') ==  that.changeToStr(that.alreadyArr)){
                        tip.innerHTML = '密码设置成功！';
                        that.endSecondValidate = true;
                        that.reflowCanvas();
                    }else{
                        tip.innerHTML = '两次输入的密码不一致，请重新设置密码！';
                        that.secondInput = false;
                        that.notSame = true;
                        that.reflowCanvas();
                    }
                }
                //密码少于5个圆需重新设置
                if(!userValidate.checked){
                    if(alreadyLength < 5){
                        tip.innerHTML = '密码太短，至少需要5个点！';
                        setTimeout(function () {
                            that.reflowCanvas();
                        },1000);
                    }else{//密码大于4个圆，下一次便可验证密码，因此将secondInput = true
                        if(!that.endSecondValidate && !that.notSame){
                            window.localStorage.zyCooridate = that.changeToStr(that.alreadyArr);
                            tip.innerHTML = '请再次输入手势密码';
                            that.secondInput = true;
                            that.reflowCanvas();
                        }
                    }
                }*/
            });
        },
        reflowCanvas:function () {
           var lock = this.settings.parent,
               canvas = document.getElementsByTagName('canvas')[0];
            lock.removeChild(canvas);
            this.init(this.settings);
            this.alreadyArr = [];

        },
        //将圆心坐标转换为字符串
        changeToStr:function (arr) {
            var str = '';
            for(var i =0,j = arr.length; i<j; i++){
                str += arr[i].x+':'+arr[i].y+','
            }
            return str;

        },
        //已经触摸过的圆高亮显示
        drawPointLine:function (arr) {
            for(var i =0,j = arr.length - 1; i<j; i++){
                this.drawLine(arr[i].x,arr[i].y,arr[i+1].x,arr[i+1].y,'#E57679');
                this.drawCircle(arr[i].x,arr[i].y,this.settings.circleD/2,'#FEA625');
                this.drawCircle(arr[i+1].x,arr[i+1].y,this.settings.circleD/2,'#FEA625');
            }
        },
        //获取触摸点的位置
        getCoordinate:function (e) {
            e = myEvent.getEvent(e);
            var moveX = e.touches[0].clientX,//触摸点距离设备屏幕左边的距离
                moveY = e.touches[0].clientY,//触摸点距离设备屏幕上边的距离
                cX = moveX - canvas.offsetLeft ,
                cY = moveY - canvas.offsetTop;//cX,cY表示触摸点在画布上的位置
            return {
                x:cX,
                y:cY
            }
        },
        //画直线
        drawLine:function (x0,y0,x1,y1,color) {
            var canvas = document.getElementsByTagName('canvas')[0],
                context = this.contex;
            context.strokeStyle = color;
            context.lineWidth = '5px';
            context.beginPath();
            context.moveTo(x0,y0);
            context.lineTo(x1,y1);
            context.stroke();
            context.closePath();
        }
    };
    myEvent = {
        addHandler : function(element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        removeHandler : function(element, type, handler) {
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, handler);
            } else {
                element["on" + type] = null;
            }
        },
        getEvent : function(event) {
            return event ? event : window.event;
        },
        getTarget : function(event) {
            return event.target || event.srcElement;
        },
        preventDefaultHandler : function(event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        },
        stopPropagationEvent : function(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },
    };
    window.Lock = Lock;
})();
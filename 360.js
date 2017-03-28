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
            ciclrD:48 //canvas中小圆的直径
        };
        this.settings = {};
        this.canvas = null;
        this.contex = null;
        this.alreadyArr = [];//已经触摸的圆
        this.leftArr = [];//未触摸的圆
        this.circleArr = [];//保存小圆的中心坐标
        this.validate = false;//是否在验证密码
        this.endValidate = true;//验证密码阶段是否已经结束
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
                e = myEvent.getEvent(e);
                e.preventDefault();
                myEvent.addHandler(canvas,'touchmove',function (e) {
                    e = myEvent.getEvent(e);
                    var coordinate = that.getCoordinate(e),
                        i = 0,
                        arr = that.circleArr,
                        len = arr.length;
                    for(;i<len;i++){
                        if(Math.abs(coordinate.x - arr[i].x) < that.settings.circleD/2 && Math.abs(coordinate.y - arr[i].y) < that.settings.circleD/2 ){
                            if(that.alreadyArr.indexOf(arr[i]) < 0){
                                that.alreadyArr.push(arr[i]);
                            }
                            that.leftArr.splice(i,1);
                        }
                    }
                    if(that.alreadyArr.length > 1){
                        that.drawPointLine(that.alreadyArr);
                    }
                });
            });
            this.touchEnd();
        },
        touchEnd:function () {
            var that = this,
                alreadyLength,
                lock = that.settings.parent,
                canvas = document.getElementsByTagName('canvas')[0],
                tip = document.getElementById('tip'),
                userValidate = document.getElementById('verifyS');
                myEvent.addHandler(canvas,'touchend',function () {
                    alreadyLength = that.alreadyArr.slice(0).length;
                if(userValidate.checked){
                    if(window.localStorage.getItem('zyCooridate') ==  that.changeToStr(that.alreadyArr)){
                        tip.innerHTML = '密码正确！';
                        that.reflowCanvas();
                    }else{
                        tip.innerHTML = '输入的密码不正确，请再次输入！';
                        that.reflowCanvas();
                    }
                }
                if(that.validate){
                    if(window.localStorage.getItem('zyCooridate') ==  that.changeToStr(that.alreadyArr)){
                        tip.innerHTML = '密码设置成功！';
                        that.endValidate = false;
                        that.reflowCanvas();
                    }
                }
                if(alreadyLength < 5){
                    tip.innerHTML = '密码太短，至少需要5个点！';
                    setTimeout(function () {
                        that.reflowCanvas();
                    },1000);
                }else{
                    if(that.endValidate){
                        window.localStorage.zyCooridate = that.changeToStr(that.alreadyArr);
                        tip.innerHTML = '请再次输入手势密码';
                        that.validate = true;
                       that.reflowCanvas();
                    }
                }
            })
        },
        reflowCanvas:function () {
           var lock = this.settings.parent,
               canvas = document.getElementsByTagName('canvas')[0];
            lock.removeChild(canvas);
            this.init(this.settings);
            this.alreadyArr = [];
            this.leftArr = this.circleArr.slice(0);

        },
        changeToStr:function (arr) {
            var str = '';
            for(var i =0,j = arr.length; i<j; i++){
                str += arr[i].x+':'+arr[i].y+','
            }
            return str;

        },
        drawPointLine:function (arr) {
            for(var i =0,j = arr.length - 1; i<j; i++){
                this.drawLine(arr[i].x,arr[i].y,arr[i+1].x,arr[i+1].y);
                this.drawCircle(arr[i].x,arr[i].y,this.settings.ciclrD/2,'#FEA625');
                this.drawCircle(arr[i+1].x,arr[i+1].y,this.settings.ciclrD/2,'#FEA625');
            }
        },
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
        drawLine:function (x0,y0,x1,y1) {
            var canvas = document.getElementsByTagName('canvas')[0],
                context = this.contex;
            context.strokeStyle = '#E57679';
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
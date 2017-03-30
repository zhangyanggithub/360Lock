1.界面设计
    将解锁功能的界面放入id为lock的div中，其他的提示信息用div+css另外布局。
2.功能设计
    变量解释：
        *new Lock(obj)：解锁密码接口，obj中包含解锁界面的宽高及其的父元素parent及上面小圆的半径。
        *this.init():绘制解锁界面
        *this.circleArr：9个圆的圆心坐标
        *touches[0]：touchstart事件或者touchmove事件中的事件属性，可根据其计算当前触摸点在canvas中的坐标
        *t*his.alreadyArr：已经触摸过的小圆的坐标数组及其是佛否能被重复添加的参考again,小圆的坐标可以重复,
            举例：alreadyArr[0]={x:'',y:'',again:true}
        *this.canAddNext :为true表示可以添加下一个位置坐标到alreadyArr中,第二次添加同一个位置时防止重复过度添加，因为若只有again
            则下次添加重复的点会过度重复添加，即只要alreadyArr中添加元素就将其置为true。
        *this.alreadyLen:已经触摸过的小圆个数，小圆不可重复，用来验证是否超过4个点
        *this.reflowCanvas():重新绘制解锁界面，其中将this.alreadyArr = 0；
        *this.phase：设置密码的阶段或者说状态，0
            this.phase==0，则在设置密码阶段
            this.phase==1，则在再次输入密码阶段
            this.phase==2，则在用户验证密码阶段（此时界面上验证密码的radio被选中）
        this.successSet:是否成功设置密码，初始化为false
    1>提供接口new Lock(obj);其中Lock是添加到window上的构造函数；同时Lock中有默认的实例参数，因此若用户不提供参数可以。
    2>Lock中首先初始化解锁功能的界面，即绘制canvas，调用this，init()根据传入的参数绘制界面上的各个圆，将9个圆的圆心坐标存
        this.circleArr 中。
    3>监听touchstart事件后监听touchmove，计算当前触摸点的坐标pos，遍历circleArr，若circleArr中的点与当前触摸点的距离小于小圆半径
        if(circleArr.indexOf(pos)<-1)， 就将当前触摸点的坐标push进alreadyArr中，canAddNext=true，alreadyLen++，即可添加重复的位置
        else if当前触摸点的again为true同时canAddNext=true，就将当前触摸点的坐标push进alreadyArr中,canAddNext=false,但如果
                alreadyArr中至少出现两次此点，则将canAddNext=true，目的是可以添加其他点的重复点到alreadyArr中。
        若alreadyArr的length>1，就将alreadyArr中相邻的两个小圆连接起来并将小圆高亮，同时计算添加的点之后是否又有两个新点加入，
            若有，则添加的点可以被重复添加。
    4>监听touchend事件，用switch判断Lock中this.phase的值，
        若this.phase==0：
            if alreadyLen < 5，提示‘密码太短，至少需要5个点！’;this.reflowCanvas()；
            else 提示‘请再次输入手势密码’;置phase=1；同时将alreadyArr存入localStorage.zyCoordinate中。this.reflowCanvas()；
            alreadyLen=0；
        若this.phase==1：
            if 再次输入的密码对应的alreadyArr == localStorage.zyCoordinate,提示‘密码设置成功！’，this.successSet = true;this.reflowCanvas()
            else 提示‘两次输入的密码不一致，请重新设置密码！’;this.reflowCanvas()；
            置this.phase=0；即可重新设置密码。alreadyLen=0；
        若this.phase==2：
            if this.successSet == true
                 if 用户输入的密码对应的alreadyArr == localStorage.zyCoordinate， 提示‘密码正确’，this.reflowCanvas()
                 else 提示‘输入的密码不正确，请再次输入！’
                 置this.phase=0，alreadyLen=0；
            else 提示‘无法验证，因为您上次未成功设置密码！请您先设置密码’，this.reflowCanvas()；alreadyLen=0；
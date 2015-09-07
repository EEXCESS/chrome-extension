define(['jquery'], function ($) {
    window.EexcessSite = {

        diagonal : 0,
        biggestParagraph: new Object(),
        highestPParagraph: '',
        prevSize : 0,
        paragraphs : new Array(),
        minX : 100,
        maxX : 0,
        minY : 100,
        maxY : 0,

        init:function(){
            console.log('EexcessSite initalized');
            $("<style type='text/css'> .highestP{ background-color:rgba(0,0,0,0.6);} </style>").appendTo("head");
            $(document).scroll(function(){
                $(EexcessSite.paragraphs).each(function(){
                    this.updatePGotRead();
                });
            });
            $(document).mousemove(function(e){
             $(EexcessSite.paragraphs).each(function(){
                this.calculateCursorDistance(e.pageX,e.pageY);
                this.updatePGotRead();
            }); 
         });
        },
        setParagraphs : function(data){
            $(data).each(function(){
                var paragraph = Object.create(EexcessParagraph);
                paragraph.par = this;
                paragraph.init();
                paragraph.calculateSize(this);
                paragraph.calculatePosition();
                EexcessSite.paragraphs.push(paragraph);                
            });
            this.getBiggestParagraph(this.paragraphs);
            this.calculateDiagonal();
            //console.log(this)
        },
        calculateDiagonal : function(){
            $(this.paragraphs).each(function(){
                if (this.x > EexcessSite.maxX) {
                    EexcessSite.maxX = this.x;
                }
                if (this.x < EexcessSite.minX) {
                    EexcessSite.minX = this.x;
                }
                if (this.y > EexcessSite.maxY) {
                    EexcessSite.maxY = this.y;
                }
                if (this.y < EexcessSite.minY) {
                    EexcessSite.minY = this.y;
                }
            });

            this.diagonal = (EexcessSite.maxX - EexcessSite.minX) * (EexcessSite.maxY - EexcessSite.minY);
        },
        getBiggestParagraph : function(paragraphs){
            $(paragraphs).each(function(){             
                EexcessSite.getBiggestPar(this.size, this);        
            });
        },
        getBiggestPar : function(size, par){
            if (size > this.prevSize) {
                this.biggestParagraph = par;
            }
            this.prevSize = size;
        }
    }
    window.EexcessParagraph = {
        pGotRead : 0,
        size : 0,
        x : 0,
        y : 0,
        height : 0,
        width : 0,
        par : new Object(),
        sizeRelation : 0,
        distance : 0,
        cursorDistance : 0,
        relationVisible : 0,
        init: function(){

        },
        updatePGotRead:function(){
            this.calculatePosition();
            this.calculateSizeRelation();
            this.calculateDistance();
            this.calculateVisible();
            //this.calculateCursorDistance();
            /*console.log(this.sizeRelation );
            console.log(this.distance);
            console.log(this.relationVisible);
            */
            this.pGotRead =  this.sizeRelation * this.distance  * this.relationVisible * this.cursorDistance;
            this.pGotRead = Math.round(this.pGotRead * 1000) / 1000;
            this.setHighestParagraph(this);
            
            this.drawGotRead();
        },
        setHighestParagraph : function(paragraph){
            console.log(paragraph);
            if (EexcessSite.highestPParagraph.pGotRead < paragraph.pGotRead || EexcessSite.highestPParagraph =='') {
                console.log('highest');
                EexcessSite.highestPParagraph = paragraph;
                $(paragraph.par.elements[0]).parent().addClass('highestP');
            }else{
                $(paragraph.par.elements[0]).parent().removeClass('highestP');
            }
            
        },
        drawGotRead:function(){
            var out = this.sizeRelation +'*'+ this.distance  +'*'+ this.relationVisible+'*'+ this.cursorDistance+'='+ this.pGotRead
            if($(this.par.elements[0]).find($('.pgotread')).length > 0){
                $(this.par.elements[0]).find($('.pgotread')).text(out);
            }else{
                $(this.par.elements[0]).prepend('<span class="pgotread" style="color:red;">'+out+'</span>');    
            }
            
            
        },
        setPar : function(data){
            this.par = data;
        },
        calculateSizeRelation : function(){
            //console.log(EexcessSite.biggestParagraph.size);
            this.sizeRelation = this.size / EexcessSite.biggestParagraph.size;
            this.sizeRelation = Math.round(this.sizeRelation * 1000) / 1000; 
        },
        calculatePosition : function(){
            var pos = $(this.par.elements[0]).offset();
            this.x =  pos.left;
            this.y = pos.top;
        },
        calculateSize : function(par){
            var height = 0;
            var width = 0;
            var prevwidth = 0;        
            $(par.elements).each(function(){
                height += $(this).height();  
                if ($(this).width() > prevwidth) {
                    width = $(this).width();
                }
                prevwidth = $(this).width();
            });
            this.height = height;
            this.width = width;
            this.size = height * width;        
        },
        calculateDistance : function(){
           /* console.log(EexcessSite.diagonal);
            console.log(this.x);
            console.log(EexcessSite.minX);
            console.log(this.y);
            console.log(EexcessSite.minY);
            console.log( EexcessSite.diagonal);
            */
            this.distance = (EexcessSite.diagonal - ((this.x - EexcessSite.minX)  * (this.y - EexcessSite.minY))) / EexcessSite.diagonal;
            this.distance = Math.round(this.distance * 1000) / 1000;
        },
        
        calculateCursorDistance : function(pageX,pageY){

            this.cursorDistance = (EexcessSite.diagonal - ((this.x - pageX)  * (this.y - pageY))) / EexcessSite.diagonal;
            this.cursorDistance = Math.round(this.cursorDistance * 1000) / 1000;
            //console.log('pX'+pageX);
            //console.log('pY'+pageY);

            //console.log(this.cursorDistance);

            

        },
        
        calculateVisible : function(){
            var buttomPar = this.height + this.y;
            var visibleTop = $(document).scrollTop();
            var visibleHeight = $(window).height();
            var visibleBottom = visibleTop + visibleHeight
            

            if((buttomPar > visibleTop) && (this.y < visibleBottom)){
                this.relationVisible = 1;
                
                if(this.y < visibleTop){
                    var outside = visibleTop - this.y;
                    this.relationVisible -= (outside / this.height);
                }
                if(buttomPar > visibleBottom){
                    var outside = buttomPar - visibleBottom;
                    this.relationVisible -= (outside / this.height);
                }
                
                
                /*
                this.relationVisible = (buttomPar - visibleTop) / this.height
                if(buttomPar > visibleBottom){
                    console.log();
                    this.relationVisible =- (visibleBottom - this.y) / this.height
                }*/

            }else{
                this.relationVisible = 0;

            } 
            this.relationVisible = Math.round(this.relationVisible *1000) / 1000;
        }
    }

});

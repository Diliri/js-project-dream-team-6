const o={lines:12,length:7,width:4,radius:10,scale:1,corners:1,color:"#000",fadeColor:"transparent",animation:"spinner-line-fade-default",rotate:0,direction:1,speed:1,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:"0 0 1px transparent",position:"absolute"};class c{constructor(e={}){this.opts=Object.assign({},o,e)}spin(e){return this.stop(),this.el=document.createElement("div"),this.el.className=this.opts.className,this.el.setAttribute("role","progressbar"),r(this.el,{position:this.opts.position,width:"0",zIndex:this.opts.zIndex,left:this.opts.left,top:this.opts.top,transform:`scale(${this.opts.scale})`}),e&&e.insertBefore(this.el,e.firstChild||null),h(this.el,this.opts),this}stop(){return this.el&&(this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=void 0),this}}function r(t,e){for(let i in e)t.style[i]=e[i];return t}function h(t,e){let i=Math.round(e.corners*e.width*50)/100+"px",d=e.shadow;e.shadow===!0&&(d="0 2px 4px rgba(0,0,0,0.15)");for(let n=0;n<e.lines;n++){let l=~~(360/e.lines*n+e.rotate),s=document.createElement("div");r(s,{position:"absolute",top:`-${e.width/2}px`,left:`-${e.length}px`,width:e.length+e.radius+"px",height:e.width+"px",background:e.color,boxShadow:d,transformOrigin:"right center",transform:`rotate(${l}deg) translate(${e.radius}px, 0px)`,borderRadius:i});let a=document.createElement("div");r(a,{width:"100%",height:"100%",background:e.color,borderRadius:i,animation:`${e.animation} ${1/e.speed}s linear infinite`,animationDelay:`${n*e.direction/e.lines/e.speed-1/e.speed}s`}),s.appendChild(a),t.appendChild(s)}}if(typeof document<"u"){const t="spin-js-style";if(!document.getElementById(t)){const e=document.createElement("style");e.id=t,e.textContent=`
            @keyframes spinner-line-fade-default {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
        `,document.head.appendChild(e)}}export{c as Spinner};
//# sourceMappingURL=spin-CaFnnIC4.js.map

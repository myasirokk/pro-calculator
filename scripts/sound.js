export class KeySound{
  constructor(){this.enabled=localStorage.getItem('calc-sound')!=='off';this.ctx=null;}
  toggle(){this.enabled=!this.enabled;localStorage.setItem('calc-sound',this.enabled?'on':'off');return this.enabled;}
  play(){if(!this.enabled)return;this.ctx??=new(window.AudioContext||window.webkitAudioContext)();const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(105,t);o.frequency.exponentialRampToValueAtTime(62,t+.035);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+.045);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+.05);}
}

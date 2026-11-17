export const units={
  length:{label:'Uzunluk',base:'m',items:{m:['Metre',1],km:['Kilometre',1000],cm:['Santimetre',.01],mm:['Milimetre',.001],in:['İnç',.0254],ft:['Fit',.3048],mi:['Mil',1609.344]}},
  weight:{label:'Ağırlık',base:'kg',items:{kg:['Kilogram',1],g:['Gram',.001],mg:['Miligram',1e-6],lb:['Pound',.45359237],oz:['Ons',.028349523125]}},
  temperature:{label:'Sıcaklık',base:'c',items:{c:['Celsius'],f:['Fahrenheit'],k:['Kelvin']}},
  data:{label:'Dijital Veri',base:'b',items:{b:['Bayt',1],kb:['Kilobayt',1024],mb:['Megabayt',1048576],gb:['Gigabayt',1073741824],tb:['Terabayt',1099511627776],bit:['Bit',.125]}}
};
export function convert(value,category,from,to){
  const v=Number(value);if(!Number.isFinite(v))return '';
  if(category==='temperature'){
    const c=from==='c'?v:from==='f'?(v-32)*5/9:v-273.15;
    return to==='c'?c:to==='f'?c*9/5+32:c+273.15;
  }
  return v*units[category].items[from][1]/units[category].items[to][1];
}

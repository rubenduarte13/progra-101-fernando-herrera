export let limite: number = 100;

for (let i = 0; i <= limite; i++) {
    if (i===5){
        continue;
    } 
    console.log ('i:',i);
    
    if (i===5) {
        break;
    }
}
console.log('Fin de programa');
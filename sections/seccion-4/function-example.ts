export function greet(name:string = 'mundo') {
    console.log('Hola ' + name);
}

function addTwoNumbers(num1:number, num2:number):number {
    return num1 + num2;
}

let total:number = addTwoNumbers(10,20);
console.log('Total:', total);

// let firstName = 'Ruben';
// greet( firstName );
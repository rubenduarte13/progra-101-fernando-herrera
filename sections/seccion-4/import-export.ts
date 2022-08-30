import { addTwoNumbers,
    divideTwoNumbers,
    substractTwoNumbers, 
    timesTwoNumbers } from "../../helpers/math-helpers";

let num1:number = 20;
let num2:number = 10;

let total1:number = addTwoNumbers(num1, num2);
let total2:number = substractTwoNumbers(num1, num2);
let total3:number = timesTwoNumbers(num1, num2);
let total4:number = divideTwoNumbers(num1, num2);

console.log('Total + :', total1);
console.log('Total - :', total2);
console.log('Total * :', total3);
console.log('Total / :', total4);


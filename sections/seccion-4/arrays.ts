export let employees: string[] = ['Ruben', 'Fernando', 'Eduardo'];
export let salaries: number[] = [100, 200, 300];
//let people: string[] = ['Ruben', 'Fernando', 'Eduardo'];
//let flowers: string[] = ['Rosa', 'Girasol', 'Lirio'];

// if (people [3] === undefined) {
//     console.log ('No hay persona en people [3]');
// }else{
//     console.log (people[3]);
// }

// for (let index = 0; index < flowers.length; index++) {
//     const element = flowers[index];
//     console.log(element);
    
// }

for (let index = 0; index < employees.length; index++) {
    const employee = employees[index];
    let salary = salaries[index];
    console.log (employee + ' tiene un salario de ' + salary)
 }
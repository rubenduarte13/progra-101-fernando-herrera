//Ejercicio de multiplicación con ciclos
export let base: number  = 10;
export let limit: number = 5;

// for( let i = 1; i <= limit; i++ ) {
//     console.log( base, ' x ', i, ' = ', base * i );
// }

// let i = 1;
// while ( i <= limit ) {
//     console.log( base, ' x ', i, ' = ', base * i );
//     i++;
// }

let i = 1;
do {
    console.log( base, ' x ', i, ' = ', base * i );
    i++;
} while ( i <= limit );

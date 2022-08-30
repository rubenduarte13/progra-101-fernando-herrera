export function printMultiplicationTable(base:number, limit:number = 10) {
    if (limit <=0){
        throw new Error ('El límite debe ser mayor a cero')
    }

    for (let i = 1; i <= limit; i++) {
        console.log( base, ' x ', i, ' = ', base * i );
        
    }
}
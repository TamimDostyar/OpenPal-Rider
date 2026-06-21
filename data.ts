


// const data: Date = new Date();
// const formattedData = data.toLocaleString();

// const getMonth = data.getMonth().toLocaleString();

function replaceMonth(date: string, newMonth: string): string {
    const slashIndex = date.indexOf('/');
    let result = newMonth + date.slice(slashIndex);

    if (Number(newMonth) === 1) {
        const parts = date.split('/');
        const year = String(Number(parts[2].slice(0, 4)) + 1);
        result = result.replace(parts[2].slice(0, 4), year);
    }

    return result;
}

function aheadMonth(data: string): string {
    const slashIndex = data.indexOf('/');
    let month = Number(data.slice(0, slashIndex));

    month = month === 12 ? 1 : month + 1;

    return replaceMonth(data, month.toString());
}

const d = '11/20/2026, 6:14:30 PM';
console.log(aheadMonth(d));

// console.log(formattedData[0]);

// console.log(data.toLocaleString());

// console.log(data.getMonth());
// console.log(data.getFullYear())
// console.log(data)

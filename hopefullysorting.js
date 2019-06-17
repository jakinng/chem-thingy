//const names = "A B C D E F G H I J K L M N O P Q R S T U V W";
let names = "Catherine caeetheirn catheirjen canteen catherine katherine kathyerine kathy cathy ctehrerin camel cantine cant can cainter cerien cerine casre cally callie akatine katrina catrina katarina katehy kat cat catherine catehre ceithaekr cerijaglk celina erlkasj"
let benches = [];
const NUM_BENCHES = 6;
let order = [];

const sortArr = array => {
    for (let i = array.length - 1; i >= 0; i--) {
        const random = Math.floor(Math.random() * i);
        const temp = array[random];
        array[random] = array[i];
        array[i] = temp;        
    }
    return array;
}

const createBenches = num => {
    let b = [];
    for (let i = 1; i <=num; i++) {
        b.push(i);
    }
    sortArr(b);
    return b;
}

const doBenches = () => {
    benches = new Array(NUM_BENCHES);
    const n = sortArr(names.split(" "));
//    console.log(n);
    const classSize = n.length;
    const remainder = classSize % NUM_BENCHES;
    const ppb = Math.floor(classSize / NUM_BENCHES);
    for (let i = 0; i < remainder; i++) {
        benches[order[i] - 1] = n.splice(0, ppb + 1);
    }
    for (let i = remainder; i < NUM_BENCHES; i++) {
        benches[order[i] - 1] = n.splice(0, ppb);
    }
}

function bbbb() {
    order = createBenches(NUM_BENCHES);
//    console.log(order);
    doBenches();
    //console.log(benches);   
    for (let i = 0; i < benches.length; i++) {
        benches[i].sort();
    }
};

let somebenches = [];
for (let i = 1; i <= 6; i++) {
    somebenches.push(document.getElementById("bench" + i));
}

const button = document.getElementById("button");

button.addEventListener('click', () => {
    bbbb();
    for (let i = 0; i < 6; i++) {
       somebenches[i].innerText = benches[i].join(" "); 
    }
});

const input = document.getElementById("input-names");

input.addEventListener('change', () => {
    if (confirm("are you sure? this will change the names in the class.")) {
        names = input.value;
        input.value = "";
        input.placeholder = "names: ";
        bbbb();
        for (let i = 0; i < 6; i++) {
            somebenches[i].innerText = benches[i].join(" "); 
        }
    }
});

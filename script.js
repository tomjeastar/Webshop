let products = [];
let url = "http://localhost:3000/products";
let mode = "read";
let currentID = null;
let order = false;
let cart = [];

function formView() {
    document.getElementById("form").classList.remove("d-none")
}

//űrlap elrejtése
function formHide() {
    document.getElementById("form").classList.add("d-none")
}

//Id generátor
function idGen() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

//id alapján megkeresi az index-et: id -> index
function searchIndex(id) {
    for (let index = 0; index < products.length; index++) {
        if (id === products[index].id) {
            return index;
        }
    }
}
//#endregion 

//Mégse gomb működtetése
document.getElementById("cancel-product").onclick = function() {
    mode = "read";
    formHide();
};

//Create: Új áru gomb
document.getElementById("new-product").onclick = function(id) {
    document.getElementById("formHead").innerHTML = "Új áru bevitele"
    mode = "create";
    formView();
};

//Save: Mentés gomb
document.getElementById("save-product").onclick = function(event) {
    event.preventDefault();
    event = "create";

    if (mode == "create") {
        let product = {
            id: idGen(),
            name: document.getElementById("name").value,
            quantity: document.getElementById("quantity").value,
            price: document.getElementById("price").value,
            type: document.getElementById("type").value
        }
        fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                renderProducts();
            });

    } else if (mode == "update") {
        let product = {
            id: currentID,
            name: document.getElementById("name").value,
            quantity: document.getElementById("quantity").value,
            price: document.getElementById("price").value,
            type: document.getElementById("type").value
        };

        let urlUpdate = `${url}/${currentID}`
        fetch(urlUpdate, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                renderProducts();
            });
    }

    let errorList = [];
    if (!(products.name)) {
        console.log("namehiba");
        document.getElementById("name-label").classList.add("text-danger");
        errorList.push("Name hiba");
    } else {
        document.getElementById("name-label").classList.remove("text-danger");
    }
    if (!(price)) {
        console.log("namehiba");
        document.getElementById("price-label").classList.add("text-danger");
        errorList.push("Price hiba");
    } else {
        document.getElementById("price-label").classList.remove("text-danger");
    }
    if (!(type)) {
        console.log("typehiba");
        document.getElementById("type-label").classList.add("text-danger");
        errorList.push("Type hiba");
    } else {
        document.getElementById("type-label").classList.remove("text-danger");
    }
    if (!(quantity)) {
        console.log("quantityHiba");
        document.getElementById("quantity-label").classList.add("text-danger");
        errorList.push("Quantity hiba");
    } else {
        document.getElementById("quantity-label").classList.remove("text-danger");
    }

    if (errorList.length > 0) {
        return;
    }


    formHide()

    //mezők ürítése
    document.getElementById("name").value = null;
    document.getElementById("price").value = null;
    document.getElementById("quantity").value = null;
    document.getElementById("type").value = null;
}

//Kosár megmutatása
function cartRender() {
    //kosár ablak megjelenítése
    cardBoxView();

    //lista előállítása
    let cardHtml = "";
    let total = 0
    for (const product of cart) {
        cardHtml += `
        <li class="list-group-item">
            ${product.name}, ${product.type}, ${product.price} Ft/db, ${product.quantity}db ár: ${product.price*product.quantity} Ft
            <button
              type="button"
              class="btn btn-danger btn-sm"
              onclick="deleteFromCart('${product.id}')"
            >
              Törlés
            </button>
        </li>
        `;
        total += product.price * product.quantity;
    }

    //lista berkása az ul-be
    document.getElementById("cart-list").innerHTML = cardHtml;
    //total kiírása
    document.getElementById("total").innerHTML = total;
}

//kosár áru mennyiség kiszámolása, és beírása
function renderCartCount() {
    //mennyi áru van a kosárban?
    let count = cart.length;
    //Írd ki ezt az értéket a "cart-count"-ba
    document.getElementById("cart-count").innerHTML = count;
}

//Törlés a kosárból
//issue: Törlés a kosárból
function deleteFromCart(id) {
    //megkeressük a cart-ban az idexet ami az id-hez tartozik
    let index = seachIndexByIdInCart(id);
    //kiszedjük a kosárból az index-hez tartozó árut

    //darabszám korrekció
    //1. megkesem a darabszámot
    let quantity = cart[index].quantity;
    //2. megkeresem a ratkárban a kitörölt árut
    let indexPducts = searchIndex(id);
    //3. korrigálom a darbszámát
    products[indexPducts].quantity += quantity;

    cart.splice(index, 1);
    //render: kosár, kártyák
    cartRender();
    renderProducts();
}

//megkeressük a cart-ban az idexet ami az id-hez tartozik
function seachIndexByIdInCart(id) {
    let indexReturn = -1;
    for (let index = 0; index < cart.length; index++) {
        if (cart[index].id == id) {
            indexReturn = index;
            break;
        }
    }

    return indexReturn;
}

//A fizetés folymata
//issue: ki kell doglozni a fizetés folymatát
function payRender() {
    console.log("payRender()");
    cartBoxHide();
}

//Tovább vásárolok
function continueBy() {
    console.log("continueBy()");
    cartBoxHide();
}

//Kosár eltüntetése
function cartBoxHide() {
    document.getElementById("cart-box").classList.add("d-none");
}

//kosár megjelenítése
function cardBoxView() {
    document.getElementById("cart-box").classList.remove("d-none");

}




function renderProducts() {

    mode = "read";
    fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            console.log("Adatok a szervertől", data)
            products = data
            console.log("products", products);
            viewProducts(data);
        })
        .catch((error) => {
            console.log(error)
            error = "Szerver hiba"
            document.getElementById("table").innerHTML = `<h2>${error}</h2>`;

        });

}

function viewProducts(products) {


    let prodctsHtml = "";
    products.forEach(product => {
        prodctsHtml += `
    <div class="col">
        <div class="card ${product.quantity > 0 ? "" : "bg-warning"}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">Termék ár: ${product.price} Ft</p>
                <p class="card-text">Raktáron: ${product.quantity} db</p>
                <p class="card-text">Típus: ${product.type}</p>
            </div>

            <div class="d-flex flex-row m-2">

                <!-- Törlés -->
                <button type="button" 
                    class="btn btn-danger btn-sm"
                    onclick="deleteProduct('${product.id}')"
                >
                    Törlés
                </button>

                <!-- Módosítás -->
                <button type="button" 
                    class="btn btn-success btn-sm ms-2"
                    onclick="updateProduct('${product.id}')"
                >
                    Módosít
                </button>
            </div>

            <div class="d-flex flex-row m-2">
                <!-- Kosárba rakás -->
                <button type="button" 
                    class="btn btn-outline-success col-4"
                    onclick="intoCart('${product.id}')"
                >
                    <i class="bi bi-cart-plus"></i>
                </button>
                
                <!-- Mennyit rakok a kosárba -->
                <input
                    type="number"
                    class="form-control ms-2"
                    id="${product.id}"
                    value="1"
                    min="1"
                    max="${product.quantity}"
                    onchange="quantityInputCheck('${product.id}')"
                />
            </div>
        </div>
    </div>`;

    });
    document.getElementById("product-list").innerHTML = prodctsHtml;
}

function quantityInputCheck(id) {
    //kiszedjük mi van beleírva
    let quantity = +document.getElementById(id).value;
    console.log("check", id, quantity);

    //kiszedjük az id alpján, hogy a raktrban mennyi van belőle
    let index = searchIndex(id);
    let quantityProduct = products[index].quantity;
    //vizsgálódás, ha többet, vagy negatívot írtunk, akkor korrigálunk
    if (quantity < 0) {
        document.getElementById(id).value = 1;
    } else if (quantity > quantityProduct) {
        document.getElementById(id).value = quantityProduct;
    }
}


function intoCart(id) {
    //Derítsük ki az indexet
    let index = searchIndex(id);

    let quantity = +document.getElementById(`${id}`).value

    //Mennyiség korrektció:
    //le kell vonni az eredeti mennyiségből
    products[index].quantity = products[index].quantity - quantity;


    let product = {...products[index] }
    product.quantity = quantity;


    //van-a kosárban id-jű áru???
    let indexCart = seachIndexByIdInCart(id);
    if (indexCart === -1) {
        //még nincs ilyen áru a kosárban
        //push a kosárba
        cart.push(product);
    } else {
        cart[indexCart].quantity += quantity;
    }

    renderProducts();
    renderCartCount()

    //logojuk a kosarat
    console.log(cart);

}

function updateProduct(id) {
    document.getElementById("formHead").innerHTML = "Áru módosítása"
    mode = "update";
    let urlUpdate = `${url}/${id}`
    fetch(urlUpdate)
        .then((response) => response.json())
        .then((data) => {
            currentID = data.id;
            document.getElementById("name").value = data.name;
            document.getElementById("quantity").value = data.quantity;
            document.getElementById("price").value = data.price;
            document.getElementById("type").value = data.type;
        })
    formView()
}

function deleteProduct(id) {
    let urlDelete = `${url}/${id}`
    fetch(urlDelete, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            renderTable();
        })
        .catch((error) => console.log(error))
}

window.onload = renderProducts;
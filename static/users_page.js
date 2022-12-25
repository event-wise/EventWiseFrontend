var items;
var token = "123";


window.addEventListener('load', function () {
    if(this.document.getElementById("dont") == null){
        getData();
    }
});
async function getData() {
    
    const res1 = await fetch("/authToken")

    token = await res1.json();

    const res2 = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/get-all-users", 
    {headers: { Authorization: token}})
    items = await res2.json();
    listUsers();
}



function listUsers(){
    
    if (document.getElementById("users_table") == null) {
        var div = document.createElement("div");
        div.setAttribute("class", "table_wrap");
        var table = document.createElement("TABLE");
        table.setAttribute("class", "table is-bordered is-fullwidth");
        table.setAttribute("id", "users_table");
        document.body.appendChild(div);
        div.appendChild(table);
    }
    else {
        var table = document.getElementById("users_table");
        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }
    }
    var row_header = document.createElement("TR");

    var usernameH = document.createElement("TH");
    var createUser = document.createElement("TH");
    var searchUser = document.createElement("TH");

    var createB = document.createElement("button");
    createB.setAttribute("class", "button is-rounded is-link");
    createB.setAttribute("type", "create");
    createB.setAttribute("id", "create_user");
    createB.innerText = "Add User";
    createB.addEventListener("click",addUser)

    var searchBar = document.createElement("INPUT");
    searchBar.setAttribute("class", "input");
    searchBar.setAttribute("type", "text");
    searchBar.setAttribute("id", "searchBar");
    searchBar.setAttribute("value", "");
    searchBar.addEventListener("input",displayUsers)

    row_header.appendChild(usernameH);
    row_header.appendChild(createUser);
    row_header.appendChild(searchUser)

    createUser.appendChild(createB);
    usernameH.appendChild(document.createTextNode("Username"));
    searchUser.appendChild(searchBar)

    table.appendChild(row_header);
    function displayUsers(){
        while(table.childNodes.length>1){
            table.removeChild(table.lastChild)
        }
        if (items) {

            for (const x in items) {
                
                var item = items[x];
                if(searchBar.value=="" || item["username"].includes(searchBar.value)){
                
                    var row = document.createElement("TR");


                    var usernameCell = document.createElement("TD");
                    var updateButton = document.createElement("TD");  
                    var deleteButton = document.createElement("TD");

                    row.appendChild(usernameCell);
                    row.appendChild(updateButton);     
                    row.appendChild(deleteButton);

                    var username = document.createTextNode(item["username"]);
                    var deleteB = document.createElement("button");
                    deleteB.setAttribute("class", "button is-rounded is-danger");
                    deleteB.setAttribute("type", "delete");
                    deleteB.setAttribute("id", item["id"]);
                    deleteB.innerText = "Delete";
                    deleteB.addEventListener("click", deleteUser);

                    var updateB = document.createElement("button");
                    updateB.setAttribute("class", "button is-rounded is-success");
                    updateB.setAttribute("type", "update");
                    updateB.setAttribute("id", item["id"]);
                    updateB.innerText = "Update";
                    updateB.addEventListener("click", updateUser);

                    usernameCell.appendChild(username);
                    updateButton.appendChild(updateB);
                    deleteButton.appendChild(deleteB);

                    table.appendChild(row);
                }
                }

            }
        }
        displayUsers();
        
}

async function deleteUser(event){
    var user_id = event.target.id
    const res = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/delete-user", 
    {method: 'POST',
    headers: { Authorization: token,"Content-Type": "application/json"},
    body: JSON.stringify({"id":user_id})
    })
    const resp = await res.json();
    if(resp["status"]==200){
        var index = items.findIndex(o => o.id == user_id)
        if (index !== -1) {
            console.log(index);
            items.splice(index, 1);
        }
        alert("Succesfully deleted");
    }
    else{
        alert(resp["error"]);
    }
    listUsers();
}

function updateUser(event){
    var user_id = event.target.id;
    var index = items.findIndex(o => o.id == user_id);
    var user = items[index];
    var mapForm = document.createElement("form");
    mapForm.target = "Map";
    mapForm.method = "POST";
    mapForm.action = "/update_user";

    for (key in user){
        if(key != "roles"){
            var mapInput = document.createElement("input");
            mapInput.type = "text";
            mapInput.name = key;
            mapInput.value = user[key];
            mapForm.appendChild(mapInput);
        }
        else{
            var mapInput = document.createElement("input");
            mapInput.type = "text";
            mapInput.name = "role";
            var string = "user";
                for(role in user[key]){
                    if(user[key][role]["name"] == "ROLE_ADMIN"){
                        string = "admin";
                    }
                }
            mapInput.value = string;
            mapForm.appendChild(mapInput);
        }
    }
   




    document.body.appendChild(mapForm);

    map = window.open("", "Map", "status=0,title=0,height=600,width=800,scrollbars=1");
if (map) {
    mapForm.submit();   
} else {
    alert('You must allow popups for this map to work.');
}
}



async function sendUpdate(form){
    const res1 = await fetch("/authToken")
    token = await res1.json();
    var formData = new FormData(form);
    body_string = {};
    for (var pair of formData.entries()) {
        body_string[pair[0]] = pair[1];
    }
    body_string["id"] = parseInt(body_string["id"]);
    
    console.log(JSON.stringify(body_string));

    const req = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/update-user-details", 
    {method: 'POST',
    headers: { "Authorization": token, "Content-Type": "application/json"},
    body: JSON.stringify(body_string)
    })
    const resp = await req.json();
    if(resp["status"]==200){
        alert("Update Succesful");
        window.close();

    }
    else{
        alert("Update unsuccessful");
        console.log(resp);
    }
    

}


function addUser(){
    
    var mapForm = document.createElement("form");
    mapForm.target = "Map1";
    mapForm.method = "POST";
    mapForm.action = "/add_user";


    document.body.appendChild(mapForm);

    map_user = window.open("", "Map1", "status=0,title=0,height=600,width=800,scrollbars=1");
    
if (map_user) {
    mapForm.submit();   
} else {
    alert('You must allow popups for this map to work.');
}
}

async function addUserInfo(form){
    const res1 = await fetch("/authToken")
    token = await res1.json();
    var formData = new FormData(form);
    body_string = {};
    for (var pair of formData.entries()) {
        body_string[pair[0]] = pair[1];
    }
    
    console.log(JSON.stringify(body_string));

    const req = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/create-user", 
    {method: 'POST',
    headers: { "Authorization": token, "Content-Type": "application/json"},
    body: JSON.stringify(body_string)
    })
    const resp = await req.json();
    if(resp["status"]==200){
        alert("User created succesfully");
        window.close();

    }
    else{
        alert("User could not be created");
        console.log(resp);
    }
    

}
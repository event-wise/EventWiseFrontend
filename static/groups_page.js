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

    const res2 = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/get-all-groups", 
    {headers: { Authorization: token}})
    items = await res2.json();
    listGroups();
}




function listGroups(){
    
    if (document.getElementById("groups_table") == null) {
        var div = document.createElement("div");
        div.setAttribute("class", "table_wrap");
        var table = document.createElement("TABLE");
        table.setAttribute("class", "table is-bordered is-fullwidth");
        table.setAttribute("id", "groups_table");
        document.body.appendChild(div);
        div.appendChild(table);
    }
    else {
        var table = document.getElementById("groups_table");
        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }
    }
    var row_header = document.createElement("TR");

    var groupnameH = document.createElement("TH");
    var createGroup = document.createElement("TH");
    var searchGroup = document.createElement("TH");

    var createB = document.createElement("button");
    createB.setAttribute("class", "button is-rounded is-link");
    createB.setAttribute("type", "create");
    createB.setAttribute("id", "create_group");
    createB.innerText = "Add Group";
    createB.addEventListener("click",addGroup)

    var searchBar = document.createElement("INPUT");
    searchBar.setAttribute("class", "input");
    searchBar.setAttribute("type", "text");
    searchBar.setAttribute("id", "searchBar");
    searchBar.setAttribute("value", "");
    searchBar.addEventListener("input",displayGroups)

    row_header.appendChild(groupnameH);
    row_header.appendChild(createGroup);
    row_header.appendChild(searchGroup)

    createGroup.appendChild(createB);
    groupnameH.appendChild(document.createTextNode("Groupname"));
    searchGroup.appendChild(searchBar)

    table.appendChild(row_header);
    function displayGroups(){
        while(table.childNodes.length>1){
            table.removeChild(table.lastChild)
        }
        if (items) {

            for (const x in items) {
                
                var item = items[x];
                if(searchBar.value=="" || item["groupName"].includes(searchBar.value)){
                
                    var row = document.createElement("TR");


                    var groupnameCell = document.createElement("TD");
                    var updateButton = document.createElement("TD");  
                    var deleteButton = document.createElement("TD");

                    row.appendChild(groupnameCell);
                    row.appendChild(updateButton);     
                    row.appendChild(deleteButton);

                    var groupname = document.createTextNode(item["groupName"]);
                    var deleteB = document.createElement("button");
                    deleteB.setAttribute("class", "button is-rounded is-danger");
                    deleteB.setAttribute("type", "delete");
                    deleteB.setAttribute("id", item["id"]);
                    deleteB.innerText = "Delete";
                    deleteB.addEventListener("click", deleteGroup);

                    var updateB = document.createElement("button");
                    updateB.setAttribute("class", "button is-rounded is-success");
                    updateB.setAttribute("type", "update");
                    updateB.setAttribute("id", item["id"]);
                    updateB.innerText = "Update";
                    updateB.addEventListener("click", updateGroup);

                    groupnameCell.appendChild(groupname);
                    updateButton.appendChild(updateB);
                    deleteButton.appendChild(deleteB);

                    table.appendChild(row);
                }
                }

            }
        }
        displayGroups();
        
}

async function deleteGroup(event){
    var groupId = event.target.id
    const res = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/delete-group", 
    {method: 'POST',
    headers: { Authorization: token,"Content-Type": "application/json"},
    body: JSON.stringify({"id":groupId})
    })
    const resp = await res.json();
    console.log(resp)
    if(resp["status"]==200){
        var index = items.findIndex(o => o.id ==groupId)
        if (index !== -1) {
            console.log(index);
            items.splice(index, 1);
        }
        alert("Succesfully deleted");
    }
    else{
        alert(resp["error"]);
    }
    listGroups();
}

function updateGroup(event){
    var user_id = event.target.id;
    var index = items.findIndex(o => o.id == user_id);
    var user = items[index];
    var mapForm = document.createElement("form");
    mapForm.target = "Map";
    mapForm.method = "POST";
    mapForm.action = "/update_group";

    for (key in user){
        var mapInput = document.createElement("input");
        mapInput.type = "text";
        if(key == "ownerUserName"){

        }
        else if(key != "id"){
            mapInput.name = key;
            mapInput.value = user[key];
            mapForm.appendChild(mapInput);
        }
        else{
            mapInput.name = "groupId";
            mapInput.value = user[key];
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
    body_string["groupId"] = parseInt(body_string["groupId"]);
    
    console.log(JSON.stringify(body_string));

    const req = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/update-group-details", 
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


function addGroup(){
    
    var mapForm = document.createElement("form");
    mapForm.target = "Map1";
    mapForm.method = "POST";
    mapForm.action = "/add_group";


    document.body.appendChild(mapForm);

    map_user = window.open("", "Map1", "status=0,title=0,height=600,width=800,scrollbars=1");
    
if (map_user) {
    mapForm.submit();   
} else {
    alert('You must allow popups for this map to work.');
}
}

async function addGroupInfo(form){
    const res1 = await fetch("/authToken")
    token = await res1.json();
    var formData = new FormData(form);
    body_string = {};
    for (var pair of formData.entries()) {
        body_string[pair[0]] = pair[1];
    }
    
    console.log(JSON.stringify(body_string));

    const req = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/create-global-group", 
    {method: 'POST',
    headers: { "Authorization": token, "Content-Type": "application/json"},
    body: JSON.stringify(body_string)
    })
    const resp = await req.json();
    if(resp["status"]==200){
        alert("Group created succesfully");
        window.close();

    }
    else{
        alert("Group could not be created");
        console.log(resp);
    }
    

}
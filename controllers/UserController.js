class UserController {

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
    }

    onEdit() {

        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e=>{

            this.showPanelCreate();
            
        }); 

        this.formUpdateEl.addEventListener('submit', event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector('[type=submit]');

            btn.disable = true;

            let values = this.getValues(this.formUpdateEl);

            console.log(values);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            tr.dataset.user = JSON.stringify(values);

            tr.innerHTML = `
                <tr>
                    <td><img src="${values.photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${values.name}</td>
                    <td>${values.email}</td>
                    <td>${values.admin ? 'Sim' : 'Não' }</td>
                    <td>${values.register.toLocaleString('pt-BR')}</td>
                    <td>
                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                    </td>
                </tr>
            `;

            this.addEventsTr(tr);

            this.updateCount();

        });

    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector('[type=submit]');

            btn.disable = true;

            let values = this.getValues(this.formEl);

            if (!values){ 
                
                return false;
            
            } else {

                this.getPhoto().then(
                    //case: it works -> Primise..
                    content => {
                        values.photo = content;
                        this.addLine(values);
                        this.formEl.reset();
                        btn.disable = false;

                    },
                    // case: not work 
                    e => {
                        console.error(e);
                    }
                );
            }
        });
    }

    getPhoto(){

        //promise is prepared to (1) 'resolve', if works and (2) 'reject', if not work
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            
            let elements = [...this.formEl.elements].filter(item=>{
                if (item.name === 'photo') return item;
            });
            
            //its possible to return more than one element, so we need 'elements[0]' and 'files[0]' because its a colletion 
            let file = (elements[0].files[0]);

            fileReader.onload = ()=>{
                //works
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                //not work
                reject(e);
            };

            //if user do not select a img, 'resolve' add a default img
            file ? fileReader.readAsDataURL(file) : resolve('dist/img/boxed-bg.jpg');
        });
    }

    getValues(formE1){

        let user = {};
        let isValid = true;

        [...formE1.elements].forEach(field => {
            
            //is one of this labels (required) and are his values empty?
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');
                isValid = false;
            }   

            if (field.name == 'gender'){
                if (field.checked) user[field.name] = field.value;

            } else if (field.name == 'admin'){
                user[field.name] = field.checked;

            } else {
                user[field.name] = field.value;
            }
        });
    
        if (isValid) {
            return new User(
                user.name,
                user.gender,
                user.birth,
                user.country,
                user.email,
                user.password,
                user.photo,
                user.admin
            );

        } else {
            return false;
        }
    }

    addLine(dataUser){

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <tr>
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${dataUser.admin ? 'Sim' : 'Não' }</td>
                <td>${dataUser.register.toLocaleString('pt-BR')}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>
            </tr>
        `;
        
        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount(); 
    }

    addEventsTr(tr){

        tr.querySelector('.btn-edit').addEventListener('click', e => {

            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector('#form-user-update');

            form.dataset.trIndex = tr.sectionRowIndex

            for (let name in json) {
                
                let field = form.querySelector('[name=' + name.replace("_","") + ']');
                
                if (field){

                    switch (field.type) {
                        
                        case 'file':
                            continue;
                            break;
                        
                        case 'radio':
                            field = form.querySelector('[name=' + name.replace("_","") + '][value=' + json[name] + ']');
                            field.checked = true;
                            break;
                        
                        case 'checkbox':
                            field.checked = json[name];
                            break;

                        default:
                            field.value = json[name];
                            break;
                    }
                }
            }
            
            this.showPanelUpdate();
        })
    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {
            
            numberUsers++;  
            let user = JSON.parse(tr.dataset.user);
            
            if (user._admin) numberAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }

    showPanelCreate(){
        document.querySelector('#box-user-create').style.display = "block";
        document.querySelector('#box-user-update').style.display = "none";
    }

    showPanelUpdate(){
        document.querySelector('#box-user-create').style.display = "none";
        document.querySelector('#box-user-update').style.display = "block";
    }
}

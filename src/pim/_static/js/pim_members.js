const members = {
    table_id:"", url_save:"", url_delete:"", url_exit:"", keyfield:"",
    params:null, table:null, curtype:0, ikmember:null,

    init()
    {
        this.url_exit = this.urlReferrer();
        this.table = document.getElementById(this.table_id);
        const btnSave = document.getElementById("btn-save");
        const type = document.getElementById("type");
        this.ikmember = document.getElementById("member");
        const btnAdd = document.getElementById("btn-add");
        const btnDel = document.getElementById("btn-del");

        btnSave.addEventListener("click", () => this.save());

        type.addEventListener("change", (e) => {
            const option = e.target.selectedOptions[0];
            this.curtype = Number(e.target.value);
            this.ikmember.dataset.source = option.dataset.source;
            this.ikmember.clear();
        });

        btnAdd.addEventListener("click", () => this.addUsr());
        btnDel.addEventListener("click", () => this.delUsr());

        // window.addEventListener('beforeunload', (e) => sessionStorage.clear());

        tools.trigger(type,"change");
    },

    urlReferrer()
    {
        const referrer = document.referrer;
        const href = window.location.href;

        if (referrer != href) sessionStorage.setItem('referrer',referrer);
        return sessionStorage.getItem('referrer');
    },

    filterData(){return (this.table?.DataArray??[]).filter((row) => { return Object.keys(row??{}).length >= this.table.Columns.length });},

    addUsr()
    {
        let data = this.ikmember.getValue();
        if (!data) return;
        let array = this.table.DataArray;
        let found = array.findIndex(row => row?.guid == data.guid) > -1;
        if (found) return;

        let member =
        {
            type: (this.curtype==0) ? "Usuario" : "Grupo",
            id: data.id,
            name: data.name,
            calendar: this.params?.calendar,
            es_grupo: this.curtype,
            guid: data.guid,
            crear: "No",
            editar: "No",
            eliminar: "No"
        }

        let _rows = this.filterData();
        let _index = _rows.length;
        if (array.length === _rows.length) this.table.AddRow();
        array[_index] = member;
        this.table.UpdateRow(_index);
        this.ikmember.clear();
    },

    delUsr()
    {
        const index = this.table.CurrentRowIndex();
        if (index < 0) return;
        const row = this.table.DataArray[index];
        if (Number(row?.sys_pk??0) < 1) {
            this.table.DeleteRow(index);
            return
        }

        if (this.req_del_usr) return;
        if (!confirm("¿Desea eliminar el registro seleccionado?")) return;
        this.req_del_usr = true;

		let endpoint = this.url_delete.replace("@_entity_id",row[this.keyfield]);
		InduxsoftCrudlModel.InvokeService(endpoint, null,
			(resp) => {
				this.table.DeleteRow(index);
                this.req_del_usr = false;
			},
			(error) => {
				if (error.message) alert(error.message);
				else
                {
                    alert("Ocurrio un error al intentar eliminar el registro.");
                    console.error(error);
                }
                this.req_del_usr = false;
			}, "DELETE", false
		);
    },

    save()
    {
        const detail = this.filterData();
        if (detail.length < 1) return;
        tools.V12FormBarDisableControls(true);

        const array = this.filterData();
        const payload =
        {
            add: array.filter(o => Number(o?.sys_pk??0) < 1),
            edt: array.filter(o => Number(o?.sys_pk??0) > 0)
        }

        InduxsoftCrudlModel.InvokeService(this.url_save,payload,
            (resp) => {
                tools.V12FormBarDisableControls(false);
                sessionStorage.clear()
                window.location.href = this.url_exit;
            },
            (error) => {
                if (error.message) alert(error.message);
                else
                {
                    alert("Ocurrio un error al guardar los registros.");
                    console.error(error);
                }
                tools.V12FormBarDisableControls(false);
            },
            "POST", false
        )
    }
}
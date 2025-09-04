var calendar = {
    form: {
        formId:"", form:null, ff:null,

        init()
        {
            new Choices('#breaks', {
                allowHTML: true,
                editItems: false,
                paste: false,
                removeItemButton: true,
                duplicateItemsAllowed: false
            });

            const days = [
                { value: 'sunday', label: 'Domingo' },
                { value: 'monday', label: 'Lunes' },
                { value: 'tuesday', label: 'Martes' },
                { value: 'wednesday', label: 'Miércoles' },
                { value: 'thursday', label: 'Jueves' },
                { value: 'friday', label: 'Viernes' },
                { value: 'saturday', label: 'Sábado' },
            ];
            new Choices('#weekend', {
                removeItemButton: true,
                searchEnabled: false,
                placeholder: false,
                shouldSort: false,
                placeholderValue: 'Selecciona los días...',
                noResultsText: 'No hay resultados',
                noChoicesText: 'No hay opciones disponibles',
                itemSelectText: 'Presiona para seleccionar'
            })
            .setChoices(days, 'value', 'label', true);

            flatpickr('#holidays', {
                mode: "multiple",
                dateFormat: "m-d"
            });
        }
    },
    schedule: {
        scheduleId:"", schedule:null, selected:null,

        init()
        {
            this.schedule = document.getElementById(this.scheduleId);
            const view = document.getElementById("view");
            const day = document.getElementById("day");

            view.addEventListener("change", (e) => this.schedule.setAttribute("view",e.target.value));
            day.addEventListener("change", (e) => this.schedule.setAttribute("day",e.target.value));
        }
    },
    members: {
        tableId:"", table:null, curtype:0, ikmember:null,
        url_save:"",

        init()
        {
            this.table = document.getElementById(this.tableId);
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
            btnDel.addEventListener("click", () => this.table.DeleteCurrentRow());

            tools.trigger(type,"change");
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

        save()
        {
            const detail = this.filterData();
            if (detail.length < 1) return;

            tools.V12FormBarDisableControls(true);
            InduxsoftCrudlModel.InvokeService(this.url_save,{detail:detail},
                (resp) => {
                    tools.V12FormBarDisableControls(false);
                },
                (error) => {
                    if (error.message) alert(error.message);
                    else console.error(error);
                    tools.V12FormBarDisableControls(false);
                },
                "POST", false
            )
        }
    }
}
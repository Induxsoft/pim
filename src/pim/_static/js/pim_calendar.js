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

            const weekend = document.getElementById('weekend');
            const weekendSelect = document.getElementById('_weekend');
            const weekendValues = weekend.value.replace(" ","").split(",");
            const days = [
                { value: 'sunday', label: 'Domingo' },
                { value: 'monday', label: 'Lunes' },
                { value: 'tuesday', label: 'Martes' },
                { value: 'wednesday', label: 'Miércoles' },
                { value: 'thursday', label: 'Jueves' },
                { value: 'friday', label: 'Viernes' },
                { value: 'saturday', label: 'Sábado' },
            ];
            days.forEach(o => { o.selected = weekendValues.includes(o.value) });

            new Choices(weekendSelect, {
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

            weekendSelect.addEventListener('change', (e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(o => o.value);
                weekend.value = selectedOptions.join(",");
            });

            const holidays = document.getElementById('holidays');
            const holidaysValues = holidays.dataset.defaultValues.replace(" ","").split(",");
            flatpickr(holidays, {
                mode: "multiple",
                dateFormat: "m-d",
                defaultDate: holidaysValues
            });
        }
    },
    schedule: {
        form_id:"", modal_id:"", schedule_id:"", keyfield:"",
        url_add_event:"", url_edt_event:"", url_del_event:"",
        form:null, modal:null, schedule:null, selected:null, params:null,

        init()
        {
            this.form = document.getElementById(this.form_id);
            this.modal = document.getElementById(this.modal_id);
            this.schedule = document.getElementById(this.schedule_id);
            const view = document.getElementById("view");
            const day = document.getElementById("day");
            const btnEdt = document.getElementById("btn-edt-event");
            const btnDel = document.getElementById("btn-del-event");
            const btnEvtOk = document.getElementById("btn-event-ok");

            view.addEventListener('change', (e) => this.schedule.setAttribute("view",e.target.value));
            day.addEventListener('change', (e) => this.schedule.setAttribute("day",e.target.value));
            btnEdt.addEventListener('click', (e) => this.edtEvent());
            btnDel.addEventListener('click', (e) => this.delEvent());
            btnEvtOk.addEventListener('click', (e) => this.addEvent());

            this.modal.addEventListener('hidden.bs.modal', (e) => { this.form.reset() });
            this.schedule.addEventListener('celldblclick', (e) => {
                this.form.elements['start'].value = e.detail.datetime;
                tools.showModal(this.modal_id);
            });
            this.schedule.addEventListener('itemclick', (e) => {    
                this.selected = e.detail;
            });
        },

        loadCalendarEvent(data=null)
        {
            if (!data && !this.selected) return;
            if (!data && this.selected) data = this.selected;

            const fields = this.form.elements;
            Object.entries(data).forEach(entry => {
                const [key, value] = entry;
                if (fields[key]) fields[key].value = value;
            });
        },

        addEvent()
        {
            if (this.req_add_event) return;
            this.req_add_event = true;

            InduxsoftCrudlModel.InvokeService(this.url_add_event, new FormData(this.form),
                (res) => {
                    this.req_add_event = false;
                    this.schedule.save(res);
                    tools.hideModal(this.modal_id);
                },
                (err) => {
                    if (err.message) alert(err.message);
                    else
                    {
                        alert("Ocurrio un error al intentar crear el evento.");
                        console.error(err);
                    }
                    this.req_add_event = false;
                },
                "POST", false, true, "", true
            )
        },

        edtEvent()
        {
            if (!this.selected) return;
            window.location.href = this.url_edt_event.replace("@_entity_id",this.selected[this.keyfield]);
        },

        delEvent()
        {
            if (this.req_del_event || !this.selected) return;
            if (!confirm("¿Esta seguro que desea eliminar el evento seleccionado?")) return;
            this.req_del_event = true;

            let endpoint = this.url_del_event.replace("@_entity_id",this.selected[this.keyfield]);
            InduxsoftCrudlModel.InvokeService(endpoint,null,
                (res) => {
                    this.req_del_event = false;
                    this.schedule.delete(this.selected?.id);
                    this.selected = null;
                },
                (err) => {
                    if (err.message) alert(err.message);
                    else
                    {
                        alert("Ocurrio un error al intentar eliminar el evento.");
                        console.error(err);
                    }
                    this.req_del_event = false;
                },
                "DELETE", false
            )
        }
    }
}
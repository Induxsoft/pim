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
            const btnAdd = document.getElementById("btn-add-event");
            const btnEdt = document.getElementById("btn-edt-event");
            const btnDel = document.getElementById("btn-del-event");
            const btnCancelEvent = document.getElementById("btn-cancel-event");
            const btnCompleteEvent = document.getElementById("btn-complete-event");

            view.addEventListener('change', (e) => this.setParameter('view',e.target.value));
            day.addEventListener('change', (e) => this.setParameter("day",e.target.value));
            btnAdd.addEventListener('click', (e) => this.addEvent());
            btnEdt.addEventListener('click', (e) => this.edtEvent());
            btnDel.addEventListener('click', (e) => this.delEvent());
            btnCancelEvent.addEventListener('click', (e) => this.changeStatus(99));
            btnCompleteEvent.addEventListener('click', (e) => this.changeStatus(1));

            this.modal.addEventListener('show.bs.modal', (e) => {
                this.form.elements['duration'].value = this.schedule.min_duration;
                tools.trigger('select[id="type"]','change');
            });
            this.modal.addEventListener('hidden.bs.modal', (e) => {
                this.toggleModalEvent();
                this.form.reset();
            });
            this.schedule.addEventListener('cellclick', (e) => {
                this.form.elements['start'].value = e.detail.datetime;
                tools.showModal(this.modal_id);
            });
            this.schedule.addEventListener('itemclick', (e) => {    
                this.toggleModalEvent(e.detail);
                tools.showModal(this.modal_id);
            });
            this.schedule.addEventListener('itemmoved', (e) => this.changeStart(e));
            this.schedule.addEventListener('itemresized', (e) => this.changeDuration(e));
            this.schedule.addEventListener('itemcreated', (e) => this.setEventStyles(e.detail.item,e.detail.element));
            this.schedule.addEventListener('itemupdated', (e) => this.setEventStyles(e.detail.newItem,e.detail.newElement));
        },

        setParameter(key,value)
        {
            console.log(key,value);
            this.schedule.setAttribute(key,value);

            let url = window.location.href;
            url = InduxsoftCrudlModel.UrlAddParameter(url,key,value);
            
            window.history.replaceState(null,'',url);
        },

        changeStatus(newStatus)
        {
            if (newStatus==99 && !confirm("¿Esta seguro que de desea cancelar el evento?")) return;

            this.edtEvent("change-status", {status:newStatus}, (res) => {
                this.schedule.renderEvent(res);
                tools.hideModal(this.modal_id);
            });
        },
        changeStart(e)
        {
            const event = JSON.parse(JSON.stringify(e.detail.item));
            this.selected = event;

            this.edtEvent("change-start", {start:event.start}, (res) => {
                if (!res)
                {
                    event.start = e.detail.from;
                    this.schedule.save(event);
                    this.selected = event;
                }
            });
        },
        changeDuration(e)
        {
            const event = JSON.parse(JSON.stringify(e.detail.item));
            this.selected = event;

            this.edtEvent("change-duration", {duration:event.duration}, (res) => {
                if (!res)
                {
                    event.duration = e.detail.oldDuration;
                    this.schedule.save(event);
                    this.selected = event;
                }
            });
        },

        toggleModalEvent(data=null)
        {
            const modalDialog = this.modal.querySelector('.modal-dialog');
            const modalContent = this.modal.querySelector('.modal-content');
            const modalFooter = this.modal.querySelector('.modal-footer');
            const modalTitle = this.modal.querySelector('.modal-title');
            const eventInfo = this.modal.querySelector('#event-info');
            const spnImportant = document.getElementById('spn-important');
            const spnDescription = document.getElementById('spn-description');
            const spnStartDuration = document.getElementById('spn-start-duration');
            const buttonsNew = modalFooter.querySelectorAll('.btn-new');
            const buttonsEdt = modalFooter.querySelectorAll('.btn-edt');
            const showEventInfo = (data != null);
            
            modalContent.style.backgroundColor = data?.backcolor ?? '';
            modalContent.style.color = data?.color ?? '';
            modalTitle.textContent = data?.tipo ?? 'Nuevo evento';
            spnImportant.hidden = !data?.important;
            spnDescription.textContent = data?.caption ?? '';
            spnStartDuration.textContent = this.getStartRange(data?.start, data?.duration);

            buttonsNew.forEach(b => b.hidden = showEventInfo);
            buttonsEdt.forEach(b => b.hidden = !showEventInfo);
            
            if (showEventInfo)
            {
                modalDialog.classList.remove('modal-lg');
                modalDialog.classList.add('modal-md');
                modalFooter.classList.add('justify-content-between');
            }
            else
            {
                modalDialog.classList.remove('modal-md');
                modalDialog.classList.add('modal-lg');
                modalFooter.classList.remove('justify-content-between');
            }

            this.selected = data;
            eventInfo.hidden = !showEventInfo;
            this.form.classList.toggle('d-none',showEventInfo);
        },
        loadCalendarEvent(data=null)
        {
            if (!data && !this.selected) return;
            if (data && !this.selected) this.selected = data;
            if (!data && this.selected) data = this.selected;

            const fields = this.form.elements;
            Object.entries(data).forEach(entry => {
                const [key, value] = entry;
                if (fields[key]) fields[key].value = value;
            });
        },
        setEventStyles(data,element)
        {
            const content = element.querySelector('.content');
            if (data.important)
            {
                content.style.cssText = `font-weight:bold;`;
            }
            switch (data.status) {
                case 0:
                    break;
                case 1:
                    content.textContent = '[Hecho] '+data.caption;
                    content.style.cssText += `text-decoration:line-through;`;
                    break;
                case 99:
                    content.textContent = '[Cancelado] '+data.caption;
                    content.style.cssText += `text-decoration:line-through;`;
                    break;
            }
        },

        getStartRange(start,duration)
        {
            if (!start || !duration) return '';
            const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

            const ini = new Date(start);
            const fin = new Date(ini.getTime() + (duration * 60000));

            function formatHour (date) {
                let h = date.getHours();
                let m = date.getMinutes().toString().padStart(2,"0");
                let t = h >= 12 ? "p.m." : "a.m.";
                
                h = h % 12;
                if (h === 0) h = 12;
                
                return `${h.toString().padStart(2,"0")}:${m} ${t}`;
            }

            const dia = dias[ini.getDay()];
            const dd = ini.getDate();
            const mes = meses[ini.getMonth()];

            return `${dia}, ${dd} de ${mes} ${formatHour(ini)} - ${formatHour(fin)}`;
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
            );
        },

        edtEvent(action="",data=null,callback=null)
        {
            if (this.req_edt_event || !this.selected) return;

            let endpoint = this.url_edt_event.replace("@_entity_id",this.selected[this.keyfield]);
            if (action == "")
            {
                window.location.href = endpoint;
            }
            else
            {
                endpoint += "?action="+action
                this.req_edt_event = true;

                InduxsoftCrudlModel.InvokeService(endpoint,data,
                    (res) => {
                        this.req_edt_event = false;
                        callback(res);
                    },
                    (err) => {
                        if (err.message) alert(err.message);
                        else
                        {
                            alert("Ocurrio un error al intentar actualizar el evento.");
                            console.error(err);
                        }
                        this.req_edt_event = false;
                        callback(null);
                    },
                    "PATCH", false
                );
            }
        },

        delEvent()
        {
            if (this.req_del_event || !this.selected) return;
            if (!confirm("¿Esta seguro que desea eliminar el evento?")) return;
            this.req_del_event = true;

            let endpoint = this.url_del_event.replace("@_entity_id",this.selected[this.keyfield]);
            InduxsoftCrudlModel.InvokeService(endpoint,null,
                (res) => {
                    this.req_del_event = false;
                    tools.hideModal(this.modal_id);
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
            );
        }
    }
}
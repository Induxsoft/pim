var events = {
    form_id:"", form:null, ff:null,
    url_bitacora:"",

    init()
    {
        this.form = document.getElementById(this.form_id);
        this.ff = this.form.elements;
        this.setLog()

        const type = this.ff['type'];
        const start = this.ff['start'];
        const duration = this.ff['duration'];
        const backcolor = this.ff['backcolor'];
        const color = this.ff['color'];

        type.addEventListener('change', (e) => {
            backcolor.value = e.target.selectedOptions[0].dataset.backcolor;
            color.value = e.target.selectedOptions[0].dataset.color;
        });
        start.addEventListener('change', (e) => this.checkStartRange());
        duration.addEventListener('change', (e) => this.checkStartRange());

        tools.trigger(type,'change');
    },

    checkStartRange()
    {
        let url = "/!/pim/events/?action=check-start-range";
        url += "&calendar="+this.ff['calendar'].value;
        url += "&start="+this.ff['start'].value;
        url += "&duration="+this.ff['duration'].value;

        InduxsoftCrudlModel.InvokeService(url, null,
            (resp) => { document.getElementById(this.form_id+"-warning")?.remove(); },
            (error) => { this.showStartRangeWarning(error) },
            "GET", false
        );
    },

    showStartRangeWarning(error)
    {
        const div = document.createElement('div');
        const id = this.form_id+"-warning";

        if (error?.message && error?.data)
        {
            div.innerHTML = `
            <b>${error?.message}</b><br>
            ${error?.data?.caption??""}<br>
            Inicio: ${error?.data?.start}, Duración: ${error?.data?.duration}min
            `;
        }
        else if (error?.message) div.innerHTML = error.message;
        else div.innerHTML = JSON.stringify(error);

        document.getElementById(id)?.remove();
        div.id = id;
        div.classList.add('alert', 'alert-warning', 'mt-1');

        this.form.insertAdjacentElement("afterend",div);
        setTimeout(() => { div.remove() }, (10 * 1000));
    },

    setLog()
    {
        if (!this.url_bitacora) return;
        const WebShell = window.top.WebShell;
        if (!WebShell) {
            console.warn("No se pudo obtener el elemento de WebShell");
            return;
        }
        WebShell.Panels.Show(WebShell.Panels.Const.Right,this.url_bitacora);
    },
    selectColor(backcolor,event)
    {
        if(!calendar?.schedule?.modal_id)return;
        if(!calendar?.schedule?.selected)return;

        let target=document.getElementById(calendar.schedule.modal_id+"-content");
        let data={backcolor:backcolor}

        let url = "/!/pim/events/"+calendar.schedule.selected.sys_pk+"/?action=change-color";

        InduxsoftCrudlModel.InvokeService(url, data,
            (resp) => 
            { 
                calendar.schedule.selected["backcolor"]=backcolor;
                calendar.schedule.schedule.save(calendar.schedule.selected);
                target.style.background=backcolor; 
            },
            (error) => { alert(error.message??error)},
            "PATCH", false
        );
    }
}
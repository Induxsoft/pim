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
            (resp) => {},
            (error) => {
                if (error.message) alert(error.message);
                else console.error(error);
            },
            "GET", false
        );
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
    }
}
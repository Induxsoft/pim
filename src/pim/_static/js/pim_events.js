var events = {
    formId:"", form:null, ff:null,
    url_bitacora:"",

    init()
    {
        tools.trigger('select[id="type"]','change');
        this.setLog()
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
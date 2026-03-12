var event_type_notif = {
    form_id: "",
    urlexit: "..",
    
    init()
    {
        const form = document.getElementById(this.form_id);
        const channel = document.getElementById('snd_channel');

        form.addEventListener('submit', e => {
            e.preventDefault();
            this._submit(e.target);
        });

        channel.addEventListener('change', e => {
            let url = window.location.href;
            let qry = (new URLSearchParams(this.formObj(form))).toString();

            window.location.href = url + (url.includes('?') ? '&' : '?') + qry;
        });

        this.initTableVars();
    },

    initTableVars()
    {
        const table = document.getElementById('table-vars');
        if (!table) return;

        const input = document.querySelector('input[name="tempvars"]');
        table.DataArray = JSON.parse(input.value || "[]");
        table._printRows();

        document.getElementById('btn-add-var')
        .addEventListener('click', () => table.AddRow());
        
        document.getElementById('btn-del-var')
        .addEventListener('click', () => table.DeleteCurrentRow());

        table.Events['rowdeleted'] = function(e) {
            input.value = JSON.stringify(e.sender.DataArray);
        }
        table.Events['fieldupdated'] = function(e) {
            input.value = JSON.stringify(e.sender.DataArray);
        }
    },

    formObj(formOrId) {
        const form = (typeof formOrId === "string") ? document.getElementById(formOrId) : formOrId;
        return Object.fromEntries(new FormData(form).entries());
    },

    _submit(form)
    {
        const formParams = document.getElementById('form-params');
        if (!formParams.reportValidity()) return;
        
        const anticipation_unit = document.getElementById('anticipation_unit')?.value || 'minutes';
        const intervals = {
            minutes: 1,
            hours: 60,
            days: 1440
        };
        let payload = this.formObj(form);
        let method = (Number(payload.sys_pk) > 0) ? 'PATCH' : 'POST';
        
        payload.advance_minutes = Math.floor(payload.advance_minutes * intervals[anticipation_unit]);
        payload.params = this.formObj(formParams);

        InduxsoftCrudlModel.InvokeService('.', payload,
            (data) => {
                window.location.href = this.urlexit;
            },
            (error) => { alert(error.message) },
            method, false
        );
    }
};
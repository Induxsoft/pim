var event_type = {
    notif: {

        form_id: "",
        urlexit: "..",
        
        init()
        {
            const form = document.getElementById(this.form_id);
            const channel = document.getElementById('snd_channel');

            const channel_receiver = document.querySelector('#form-params [name="to"]');
            const channel_message = document.querySelector('#form-params [name="message"]');
            if (channel_receiver) channel_receiver.value = "{{receiver}}";
            if (channel_message) channel_message.value = "{{content}}";

            form.addEventListener('submit', e => {
                e.preventDefault();
                this._submit(e.target);
            });

            channel.addEventListener('change', e => {
                let url = window.location.href.split('?')[0];
                let qry = (new URLSearchParams(this.formObj(form))).toString();

                window.location.href = url + '?' + qry;
            });

            // this.initTableVars();
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
            const data = Object.fromEntries(new FormData(form).entries());
            // Forzar checkboxes
            form.querySelectorAll('input[type="checkbox"]')
            .forEach(cb => {
                data[cb.name] = cb.checked;
            });

            return data;
        },

        _submit(form)
        {
            const formParams = document.getElementById('form-params');
            if (!formParams.reportValidity()) return;
            
            let payload = this.formObj(form);
            payload.params = this.formObj(formParams);

            InduxsoftCrudlModel.InvokeService('.', payload,
                (data) => {
                    window.location.href = this.urlexit;
                },
                (error) => { alert(error.message) },
                'PUT', false
            );
        }
    }
};
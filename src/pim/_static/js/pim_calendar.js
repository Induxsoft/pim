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
            const weekendValues = weekend.dataset.defaultValues.replace(" ","").split(",");
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
            new Choices(weekend, {
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
        scheduleId:"", schedule:null, selected:null,

        init()
        {
            this.schedule = document.getElementById(this.scheduleId);
            const view = document.getElementById("view");
            const day = document.getElementById("day");

            view.addEventListener("change", (e) => this.schedule.setAttribute("view",e.target.value));
            day.addEventListener("change", (e) => this.schedule.setAttribute("day",e.target.value));
        }
    }
}
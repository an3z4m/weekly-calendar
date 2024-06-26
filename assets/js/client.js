
class Client{
    constructor(clientName = '', timeslots = []){
        this.clientName = clientName;
        this.timeslots = [];
        this.setupClient();

        this.addTimeslots(timeslots);
        // add this client to the global client list
        allClients.push(this);
    }

    getName(){
        return this.clientNameInput.value;
    }

    getTimeslotsData(){
        let data = [];
        for(let timeslot of this.timeslots) 
            data.push(
            {
                'hours': timeslot.getHours(),
                'workdayIndex': timeslot.getWorkdayIndex(),
                'startIndex': timeslot.getStartIndex(),
            }
        );
        return data;
    }

    setupClient() {
        const newRow = calendarTable.insertRow();

        // Client Name Cell
        this.clientNameCell = newRow.insertCell(0);

        // add client name input
        this.clientNameInput = document.createElement('input');
        this.clientNameInput.value = this.clientName;
        this.clientNameInput.type = 'text';
        this.clientNameCell.appendChild(this.clientNameInput);

        // add new timeslot controller button
        const addTimeslotButton = document.createElement('button');
        addTimeslotButton.innerText = '+';
        addTimeslotButton.className = 'add-timeslot';
        addTimeslotButton.addEventListener('click', () => this.addNewTimeslotController());
        this.clientNameCell.appendChild(addTimeslotButton);

        // Timeslots Cell
        this.timeslotsCell = newRow.insertCell(1);


        // Weekday Cells
        for (let i = 0; i < workdays.length; i++) {
            const weekdayCell = newRow.insertCell(i + 2);
            weekdayCell.className = 'day-date';
            weekdayCell.setAttribute('data-workday-index',i);
            setupCellEvents(weekdayCell);

            // Add the current time marker if it's the current day
            if (currentDay - 1 === i && currentHour >= 8 && currentHour <= 20) {
                const marker = document.createElement('div');
                marker.className = 'current-time-marker';
                
                marker.style.left = ((currentHour - 8)) * timeslotHourWidth + firstTimeslotLeftPadding;
//                marker.style.left = ((currentHour - 8) + 0.5) * (100 / hoursPerDay) + '%';
                marker.style.height = '100%';
                weekdayCell.appendChild(marker);
            }
        }

    }

    addTimeslots(timeslots){
        //if(this.timeslots.length == 0) this.timeslots = [{'hours': 0, 'workdayIndex': 0, 'startIndex': 0}];

        for(let timeslot of timeslots){
            this.addNewTimeslotController(timeslot, true);
        }
    }


    //addNewTimeslotController(event) {
        //const addTimeslotButton = event.target;
        //const currentCell = addTimeslotButton.closest('td');
    addNewTimeslotController(timeslot = null, insertTimeslot = false) {
        // Add new timeslot control
        const timeslotController = document.createElement('div');
        timeslotController.className = 'timeslots-controls';
        this.timeslotsCell.appendChild(timeslotController);

        let newTimeslot = null;
        if(timeslot == null)  timeslot = {'hours': 0, 'workdayIndex': 0, 'startIndex': 0};
            // create new empty timeslot
        newTimeslot = new Timeslot(this, timeslot.hours, timeslot.workdayIndex, timeslot.startIndex, timeslotController);
        this.timeslots.push(newTimeslot);

        if(insertTimeslot) newTimeslot.insertTimeslot();
    };

}
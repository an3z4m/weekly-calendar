const timeslotHourWidth = 14;
    const firstTimeSlotLeftPadding = 7;
    const hoursPerDay  = 12;
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const week_workingdays = 7;

    const todayDate = new Date();
    const currentDay = todayDate.getDay();
    const currentHour = todayDate.getHours();

    // Timeslot and Workday Classes
    class Timeslot {
        //constructor(hours, element) {
        constructor(hours, controllerElement){
            this.hours = hours;
            // this.element = element;
            this.workDayIndex = -1;
            this.element = document.createElement('div');
            this.element.className = 'timeslot';
            this.element.id = generateUniqueId('timeslot');
            this.controllerElement = controllerElement;
            this.startIndex = 0;
            this.parentRow = null;
        }

        updateVerticalPosition(){
            var verticalTimeSlotPos = this.controllerElement.getBoundingClientRect().y - this.controllerElement.closest('td').getBoundingClientRect().y;
            this.element.style.top = Math.floor(verticalTimeSlotPos) - 2 + 'px';
            console.log("verticalTimeSlotPos:"+verticalTimeSlotPos);
        }
        isOngoing(){
            if(this.workDayIndex == -1) return false;
            let beginDate = new Date(workdays[this.workDayIndex].date);

            let beginTime = beginDate.setHours(beginDate.getHours() + (8 + this.startIndex))
            let endTime = beginDate.setHours(beginDate.getHours() + (8 + this.startIndex + this.hours))
             
            let currentDate = new Date();
            return (beginTime < currentDate && currentDate < endTime);
        }

    }

    const configCheckAvailability = false;

    class Workday {
        constructor(date) {
            this.date = date;
            this.timeslots = [];
            this.availableHours = Array(hoursPerDay).fill(true); // 8:00 to 20:00 (12 hours)
            this.freeHoursIndex = 0;
        }

        addTimeslot(timeslot, shiftHourIndex = 0) {
            const requiredHours = timeslot.hours;
            if(!configCheckAvailability){
                this.freeHoursIndex = shiftHourIndex;
            }else{
                this.freeHoursIndex = this.availableHours.slice(shiftHourIndex).findIndex((available, index) => {
                    if (available && index + requiredHours <= this.availableHours.length) {
                        // avoid past times
                        if(!this.isFutureDate(index)) return false;
                        return this.availableHours.slice(index, index + requiredHours).every(hour => hour);
                    }
                    return false;
                });
                
                if (this.freeHoursIndex == -1) return false;
                
                this.freeHoursIndex += shiftHourIndex;
                for (let i = 0; i < requiredHours; i++) {
                    this.availableHours[this.freeHoursIndex + i] = false;
                }
            }

                
            timeslot.workDayIndex = workdays.indexOf(this);
            timeslot.startIndex = this.freeHoursIndex;
            this.timeslots.push(timeslot);

            return true;
        }

        removeTimeslot(timeslot) {
            const timeslotIndex = this.timeslots.indexOf(timeslot);
            if (timeslotIndex !== -1) {
                for (let i = 0; i < timeslot.hours; i++) {
                    this.availableHours[timeslot.startIndex + i] = true;
                }
                this.timeslots.splice(timeslotIndex, 1);
                // update the position of timeslots after removal of a specific timeslot
                for(let workday of workdays){
                    workday.timeslots.forEach(timeslot => timeslot.updateVerticalPosition());
                }
            }
        }

        isFutureDate(startIndex) {
            if(configAllowPastAssign) return true;
            let beginDate = new Date(this.date);
            let beginTime = beginDate.setHours(beginDate.getHours() + 8 + startIndex + 1)
            const nowTime = new Date(); // now date
            return nowTime <= beginTime;
        }
    }

    // allow assigning timeslots to the past
    const configAllowPastAssign = true;
    const workdays = getCurrentWeekDates().map(dateString => new Workday(new Date(dateString)));

    function getCurrentWeekDates() {
        const dates = [];
        const firstDay = todayDate.getDate() - todayDate.getDay() + 1; // Adjust for Monday week start
        for (let i = 0; i < week_workingdays; i++) {
            const date = new Date(todayDate.getFullYear(), todayDate.getMonth(), firstDay + i);
            dates.push(date);
        }
        return dates;
    }

    function createTableHeader() {
        const tableHead = document.getElementById('table-head');
        const headerRow = document.createElement('tr');
        const headerRowStatic = document.createElement('tr');
        const daysWithDates = getCurrentWeekDates();

        // First Row Headers
        const headers = ['Client Name', 'Timeslots', ...daysWithDates.map(date => `${daysOfWeek[date.getDay()]}: ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`)];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.innerHTML = headerText;
            headerRow.appendChild(th);
        });

        // Second Row Static hours
        const staticHeaders = ['Daily Hours', '', ...Array(week_workingdays).fill('')];
        staticHeaders.forEach((headerText, index) => {
            const th = document.createElement('th');
            headerRowStatic.appendChild(th);

            if (index > 1 && index < (week_workingdays+2)) {
                const hourRuler = document.createElement('div');
                hourRuler.className = 'hour-ruler';
                const horizontalAxis = document.createElement('div');
                horizontalAxis.className = 'horizontal-axis';

                for (let j = 8; j <= 20; j++) {
                    const axisLabel = document.createElement('div');
                    axisLabel.className = 'axis-label';
                    axisLabel.innerText = j;

                    // Add tick under each hour label
                    const tick = document.createElement('div');
                    tick.className = 'tick';
                    tick.style.left = '50%';
                    axisLabel.appendChild(tick);

                    horizontalAxis.appendChild(axisLabel);
                }

                // Add the current time marker if it's the current day
                if (currentDay - 1 === index - 2 && currentHour >= 8 && currentHour <= 20) {
                    const marker = document.createElement('div');
                    marker.className = 'current-time-marker';
                    marker.style.left = ((currentHour - 8) + 0.5) * (100 / hoursPerDay) + '%';
                    marker.style.height = '100%';
                    hourRuler.appendChild(marker);
                }

                hourRuler.appendChild(horizontalAxis);
                th.appendChild(hourRuler);
            }
        });

        tableHead.appendChild(headerRow);
        tableHead.appendChild(headerRowStatic);
    }

    function addRow() {
        const table = document.getElementById('schedule-table').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();

        // Client Name Cell
        const clientNameCell = newRow.insertCell(0);
        const clientNameInput = document.createElement('input');
        clientNameInput.type = 'text';
        clientNameCell.appendChild(clientNameInput);

        const addTimeslotButton = document.createElement('button');
        addTimeslotButton.innerText = '+';
        addTimeslotButton.className = 'add-timeslot';
        addTimeslotButton.onclick = addNewTimeSlotFunction;

        clientNameCell.appendChild(addTimeslotButton);

        // Timeslots Cell
        const timeslotsCell = newRow.insertCell(1);
        const timeslotsControls = document.createElement('div');
        timeslotsControls.className = 'timeslots-controls';
        const timeslotInput = document.createElement('input');
        timeslotInput.type = 'number';
        timeslotInput.min = '0';
        timeslotInput.max = hoursPerDay;
        timeslotsControls.appendChild(timeslotInput);
        const insertTimeslotButton = document.createElement('button');
        insertTimeslotButton.innerText = '✓';
        insertTimeslotButton.className = 'insert-timeslot';
        insertTimeslotButton.onclick = insertNewTimeSlotFunction;
        timeslotsControls.appendChild(insertTimeslotButton);

        const removeTimeslotButton = document.createElement('button');
        removeTimeslotButton.innerText = '✕';
        removeTimeslotButton.className = 'remove-timeslot';

        removeTimeslotButton.onclick = removeCurrentTimeSlotFunction;
        timeslotsControls.appendChild(removeTimeslotButton);
        timeslotsCell.appendChild(timeslotsControls);

        // Weekday Cells
        for (let i = 0; i < workdays.length; i++) {
            const weekdayCell = newRow.insertCell(i + 2);
            weekdayCell.className = 'day-date';
            weekdayCell.setAttribute('data-day-index',i);
            setupCellEvents(weekdayCell);

            // Add the current time marker if it's the current day
            if (currentDay - 1 === i && currentHour >= 8 && currentHour <= 20) {
                const marker = document.createElement('div');
                marker.className = 'current-time-marker';
                marker.style.left = ((currentHour - 8) + 0.5) * (100 / hoursPerDay) + '%';
                marker.style.height = '100%';
                weekdayCell.appendChild(marker);
            }
        }
    }

    let addNewTimeSlotFunction = function(event) {
        const addTimeslotButton = event.target;
        const currentCell = addTimeslotButton.closest('td');
        const newTimeslotsControls = document.createElement('div');
        newTimeslotsControls.className = 'timeslots-controls';

        const timeslotInput = document.createElement('input');
        timeslotInput.type = 'number';
        timeslotInput.min = '1';
        timeslotInput.max = hoursPerDay;

        newTimeslotsControls.appendChild(timeslotInput);

        const insertTimeslotButton = document.createElement('button');
        insertTimeslotButton.innerText = '✓';
        insertTimeslotButton.className = 'insert-timeslot';
        insertTimeslotButton.onclick = insertNewTimeSlotFunction;

        newTimeslotsControls.appendChild(insertTimeslotButton);

        const newRemoveTimeslotButton = document.createElement('button');
        newRemoveTimeslotButton.innerText = '✕';
        newRemoveTimeslotButton.className = 'remove-timeslot';

        newRemoveTimeslotButton.onclick = removeCurrentTimeSlotFunction;
        newTimeslotsControls.appendChild(newRemoveTimeslotButton);

        currentCell.closest('tr').querySelectorAll('td')[1].appendChild(newTimeslotsControls);
    };

    var allTimeslots = [];

    let insertNewTimeSlotFunction = function(event) {
        let insertTimeslotButton = event.target;
        let currentTimeSlot = insertTimeslotButton.closest('.timeslots-controls');
        let timeslotInput = currentTimeSlot.querySelector('input');
        let hours = parseInt(timeslotInput.value, 10);

        var newTimeSlot = new Timeslot(hours, currentTimeSlot);

        currentTimeSlot.setAttribute('linked-timeslot', newTimeSlot.element.id);

        newTimeSlot.parentRow = currentTimeSlot.closest('tr');

        // Find an available workday
        const workday = workdays.find(day => day.addTimeslot(newTimeSlot));
        if (workday) {
            allTimeslots[newTimeSlot.element.id] = newTimeSlot;
            setupTimeslotEvents(newTimeSlot.element);
            newTimeSlot.workDayIndex = workdays.indexOf(workday);
            if(newTimeSlot.isOngoing()) newTimeSlot.element.style.backgroundColor = 'orange';
            newTimeSlot.element.style.width = hours * timeslotHourWidth + 'px';
            newTimeSlot.element.style.left = newTimeSlot.startIndex * timeslotHourWidth + firstTimeSlotLeftPadding + 'px';
            newTimeSlot.updateVerticalPosition();

            // var verticalTimeSlotPos = currentTimeSlot.getBoundingClientRect().y - currentTimeSlot.closest('td').getBoundingClientRect().y;
            // newTimeSlot.element.style.top = Math.floor(verticalTimeSlotPos) + 'px';
            
            currentTimeSlot.closest('tr').querySelectorAll('td')[2 + newTimeSlot.workDayIndex].appendChild(newTimeSlot.element);
            insertTimeslotButton.disabled = true;
        } else {
            alert('No available time slots for this duration.');
        }
    };

    let removeCurrentTimeSlotFunction = function(event) {
        let removeTimeslotButton = event.target;
        let parentCell = removeTimeslotButton.closest('td');
        let removedTimeslotsControls = removeTimeslotButton.closest('.timeslots-controls');
        if (parentCell.childElementCount > 0) {
            let linkedTimeslotID = removedTimeslotsControls.getAttribute('linked-timeslot');

            parentCell.removeChild(removedTimeslotsControls);

            let removedTimeslot = allTimeslots[linkedTimeslotID];
            // remove this timeslot from the old working day
            let oldWorkingDay = workdays[removedTimeslot.workDayIndex];
            oldWorkingDay.removeTimeslot(removedTimeslot);

            // let linkedTimeslot = document.getElementById(linkedTimeslotID);
            // linkedTimeslot.parentElement.removeChild(removedTimeslot.element);
            removedTimeslot.element.remove();
        }
    };

    // Initialize the table headers
    createTableHeader();

    // Allow dragging timeslots
    let dragged = null;

    function setupTimeslotEvents(timeslot) {
        timeslot.addEventListener('mousedown', function(event) {
            dragged = event.target;
            dragged.style.opacity = 0.5;
            dragged.style.position = 'absolute';
            dragged.style.zIndex = 1000;

            document.body.appendChild(dragged);

            moveAt(event.pageX, event.pageY);

            function moveAt(pageX, pageY) {
                dragged.style.left = pageX - dragged.offsetWidth / 2 + 'px';
                dragged.style.top = pageY - dragged.offsetHeight / 2 + 'px';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            timeslot.onmouseup = function(event) {
                document.removeEventListener('mousemove', onMouseMove);
                timeslot.onmouseup = null;

                draggedTimeslot = allTimeslots[dragged.id];

                let elementsBelow = document.elementsFromPoint(event.clientX, event.clientY);
                let dropTarget = elementsBelow.find(el => el.tagName === 'TD' && el !== timeslot && el.closest('table') === document.getElementById('schedule-table'));


                let droppedSuccesfully = false;

                if(dropTarget.closest('tr') != draggedTimeslot.parentRow){
                    alert('you are not allowed to move the timeslot to another client');
                    dropTarget = null;
                }

                if (dropTarget && draggedTimeslot) {

                    var dropTargetRect = dropTarget.getBoundingClientRect();
                    var draggedTimeslotRect = draggedTimeslot.element.getBoundingClientRect();

                    var relativeHourShift = draggedTimeslotRect.x - dropTargetRect.x;

                    var shiftHourIndex = Math.floor(hoursPerDay * relativeHourShift / dropTargetRect.width);

                    console.log('Width Diff = '+relativeHourShift);
                    console.log('Width Percentage = '+relativeHourShift / dropTargetRect.width);
                    console.log('Target Hour = '+shiftHourIndex);

                    let workDayIndex = dropTarget.getAttribute('data-day-index');
                    if(workDayIndex != undefined && workdays[workDayIndex]){
                        
                        let oldWorkingDay = workdays[draggedTimeslot.workDayIndex];

                        if(workdays[workDayIndex].addTimeslot(draggedTimeslot, shiftHourIndex)){
                            // move this timeslot to the target working day
                            dropTarget.appendChild(dragged);

                            // remove this timeslot from the old working day
                            oldWorkingDay.removeTimeslot(draggedTimeslot);

                            // change the index of working day
                            draggedTimeslot.workDayIndex = workDayIndex;

                            droppedSuccesfully = true;
                        }else{
                            alert('No enough working hours are available in this day');
                        }
                    }
                }

                if(!dropTarget || !droppedSuccesfully){
                    // return it back to the original cell
                    let oldWorkingDayCell = draggedTimeslot.parentRow.querySelector('td.day-date[data-day-index="'+draggedTimeslot.workDayIndex+'"]');
                    oldWorkingDayCell.appendChild(dragged);
                }

                //if(droppedSuccesfully) 
                //dragged.style.position = '';
                dragged.style.zIndex = '';
                dragged.style.left = draggedTimeslot.startIndex * timeslotHourWidth + firstTimeSlotLeftPadding + 'px';
                draggedTimeslot.updateVerticalPosition();
                //dragged.style.top = '';
                dragged.style.opacity = '';
                dragged = null;
            };
        });

        timeslot.addEventListener('dragend', function(event) {
            event.target.style.opacity = '';
        });
    }

    function setupCellEvents(td) {
        td.addEventListener('dragover', function(event) {
            event.preventDefault();
        });

        td.addEventListener('drop', function(event) {
            event.preventDefault();
            if (dragged) {
                td.appendChild(dragged);
                dragged.style.position = '';
                dragged.style.zIndex = '';
                dragged.style.left = '';
                //dragged.style.top = '';
                dragged.style.opacity = '';
                dragged = null;
            }
        });
    }

    function generateUniqueId(prefix = 'id') {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    // Initial row
    addRow();
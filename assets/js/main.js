

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

            for (let j = startingHour; j <= endingHour; j++) {
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
                marker.style.left = ((currentHour - 8)) * timeslotHourWidth + firstTimeslotLeftPadding / 2 + 'px';
//                marker.style.left = ((currentHour - 8) + 0.5) * (100 / hoursPerDay) + '%';
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
            if(dragged == null) return;
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

            if(dropTarget.closest('tr') != draggedTimeslot.controllerElement.closest('tr')){
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

                let workdayIndex = dropTarget.getAttribute('data-workday-index');
                if(workdayIndex != undefined && workdays[workdayIndex]){
                    
                    let oldWorkingDay = workdays[draggedTimeslot.getWorkdayIndex()];

                    if(workdays[workdayIndex].addTimeslot(draggedTimeslot, shiftHourIndex)){
                        // move this timeslot to the target working day
                        dropTarget.appendChild(dragged);

                        // remove this timeslot from the old working day
                        oldWorkingDay.removeTimeslot(draggedTimeslot);

                        // change the index of working day
                        draggedTimeslot.setWorkdayIndex(workdayIndex);
                        draggedTimeslot.setStartIndex(shiftHourIndex);

                        draggedTimeslot.element.style.backgroundColor = draggedTimeslot.isOngoing() ? 'orange' : '';

                        droppedSuccesfully = true;
                    }else{
                        alert('No enough working hours are available in this day');
                    }
                }
            }

            if(!dropTarget || !droppedSuccesfully){
                // return it back to the original cell
                let oldWorkingDayCell = draggedTimeslot.controllerElement.closest('tr').querySelector('td.day-date[data-day-index="'+draggedTimeslot.getWorkdayIndex()+'"]');
                oldWorkingDayCell.appendChild(dragged);
            }

            //if(droppedSuccesfully) 
            //dragged.style.position = '';
            dragged.style.zIndex = '';
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

const calendarTable = document.getElementById('schedule-table').getElementsByTagName('tbody')[0];


workdays = getCurrentWeekDates().map(dateString => new Workday(new Date(dateString)));


function saveCalendar(){
    let jsonData = {};
    for(let client of allClients){
        jsonData[client.getName()] = client.getTimeslotsData();
    }
    return jsonData;
}

function loadCalendar(){
    for(const clientName in loadedCalendar){
        new Client(clientName, loadedCalendar[clientName])
    }
}
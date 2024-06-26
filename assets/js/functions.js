function generateUniqueId(prefix = 'id') {
    return `${prefix}-${crypto.randomUUID()}`;
}

let insertNewTimeslotFunction = function(event) {
    let insertTimeslotButton = event.target;
    let timeslotController = insertTimeslotButton.closest('.timeslots-controls');
    let timeslotInput = timeslotController.querySelector('input');
    let hours = parseInt(timeslotInput.value, 10);

    if(hours <= 0) {
        alert('You must type a positive number of hours');
        return;
    }

    let workdayIndex = timeslotController.getAttribute('data-workday-index');
    let startIndex = timeslotController.getAttribute('data-start-index');

    var newTimeslot = new Timeslot(hours, workdayIndex, startIndex, timeslotController);

    timeslotController.setAttribute('linked-timeslot', newTimeslot.element.id);

    newTimeslot.parentRow = timeslotController.closest('tr');

    let workday = workdays[0];

    if(workdayIndex && workdayIndex != -1){
        // Find an available workday
        workday = workdays[workdayIndex];
    }else{
        // Find an available workday
        workday = workdays.find(day => day.addTimeslot(newTimeslot));
    }

    if (workday) {
        allTimeslots[newTimeslot.element.id] = newTimeslot;
        setupTimeslotEvents(newTimeslot.element);
        newTimeslot.workdayIndex = workdays.indexOf(workday);
        if(newTimeslot.isOngoing()) newTimeslot.element.style.backgroundColor = 'orange';
        newTimeslot.element.style.width = hours * timeslotHourWidth + 'px';
        newTimeslot.element.style.left = newTimeslot.startIndex * timeslotHourWidth + firstTimeslotLeftPadding + 'px';
        newTimeslot.updateVerticalPosition();

        // var verticalTimeslotPos = timeslotController.getBoundingClientRect().y - timeslotController.closest('td').getBoundingClientRect().y;
        // newTimeslot.element.style.top = Math.floor(verticalTimeslotPos) + 'px';
        
        timeslotController.closest('tr').querySelectorAll('td')[2 + newTimeslot.workdayIndex].appendChild(newTimeslot.element);
        insertTimeslotButton.disabled = true;
    } else {
        alert('No available time slots for this duration.');
    }
};

let removetimeslotControllerFunction = function(event) {
    let removeTimeslotButton = event.target;
    let parentCell = removeTimeslotButton.closest('td');
    let removedtimeslotController = removeTimeslotButton.closest('.timeslots-controls');
    if (parentCell.childElementCount > 0) {
        let linkedTimeslotID = removedtimeslotController.getAttribute('linked-timeslot');

        parentCell.removeChild(removedtimeslotController);

        let removedTimeslot = allTimeslots[linkedTimeslotID];
        // remove this timeslot from the old working day
        let oldWorkingDay = workdays[removedTimeslot.workdayIndex];
        oldWorkingDay.removeTimeslot(removedTimeslot);

        // let linkedTimeslot = document.getElementById(linkedTimeslotID);
        // linkedTimeslot.parentElement.removeChild(removedTimeslot.element);
        removedTimeslot.element.remove();
    }
};
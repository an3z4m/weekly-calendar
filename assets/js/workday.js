// Workday Class

class Workday {
    constructor(date) {
        this.date = date;
        this.timeslots = [];
        this.availableHours = Array(hoursPerDay).fill(true); // 8:00 to 20:00 (12 hours)
        this.freeHoursIndex = 0;
    }

    addTimeslot(timeslot, shiftHourIndex = 0) {
        const requiredHours = timeslot.getHours();
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
            
//        timeslot.setWorkdayIndex(workdays.indexOf(this));
//        timeslot.setStartIndex(this.freeHoursIndex);

        this.timeslots.push(timeslot);

        return true;
    }

    removeTimeslot(timeslot) {
        const timeslotIndex = this.timeslots.indexOf(timeslot);
        if (timeslotIndex !== -1) {
            for (let i = 0; i < timeslot.getHours(); i++) {
                this.availableHours[timeslot.getStartIndex() + i] = true;
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


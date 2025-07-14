const db = require("../models");





verifySpace = (req, res, next) => {
  const { capacity, location} = req.body;
  
  if (!location || !/^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]{1,35}$/.test(location)) {
    return res.status(400).send({
      message: "Failed! Location must be 1-35 letters and spaces only."
    });
  }


  if (!capacity || !/^[0-9_\-]{1,20}$/.test(capacity) ) {
    return res.status(400).send({
      message: "Failed! Capacity must be a number between 1 and 30."
    });
  }


  next();
};

verifyActivity = (req, res, next) => {

  console.log("Emppppp esto")

  const { classname, location , description, capacity, monitor } = req.body;
  
  if (!classname || !/^[a-zA-Z0-9\s]{2,20}$/.test(classname) ) {
    res.status(400).send({
      message: "Failed! classname can only contain letters and spaces."
    });
    return;
  }
  if (!location || !/^[a-zA-Z0-9\s]{1,20}$/.test(location) ) {
    res.status(400).send({
      message: "Failed! location can only contain letters and spaces."
    });
    return;
  }
  if (!description || !/^[a-zA-Z0-9\s]{2,20}$/.test(description) ) {
    res.status(400).send({
      message: "Failed! Name can only contain letters and spaces."
    });
    return;
  }
  if (!capacity || !/^[0-9]{1,2}$/.test(capacity)) {
    res.status(400).send({
      message: "Failed! invalid Number."
    });
    return;
  }

  if (!monitor || !/^[a-zA-Z\s]{2,20}$/.test(monitor) ) {
    res.status(400).send({
      message: "Failed! Name can only contain letters and spaces."
    });
    return;
  }



  /*
  const daysEnum = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const seenSchedules = new Set();

  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i];
    const { startTime, endTime, dayOfWeek, isSingle, specificDate } = s;

    if (typeof isSingle !== "boolean") {
      return res.status(400).send({
        message: `Failed! isSingle must be true or false in schedule ${i + 1}.`
      });
    }

    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return res.status(400).send({
        message: `Failed! Invalid time format in schedule ${i + 1}. Use HH:MM.`
      });
    }

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);


    if (start < 480 || end > 1440 || start >= end) {
      return res.status(400).send({
        message: `Failed! Schedule ${i + 1} must be between 08:00 and 24:00 and end after start.`
      });
    }

    if (!daysEnum.includes(dayOfWeek)) {
      return res.status(400).send({
        message: `Failed! Invalid dayOfWeek in schedule ${i + 1}. Must be one of: ${daysEnum.join(", ")}.`
      });
    }

    if (isSingle && specificDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
        return res.status(400).send({
          message: `Failed! Invalid specificDate format in schedule ${i + 1}. Use YYYY-MM-DD.`
        });
      }

      const dateObj = new Date(specificDate);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).send({
          message: `Failed! specificDate in schedule ${i + 1} is not a real date.`
        });
      }
    }

    const key = isSingle
      ? `single-${specificDate}-${startTime}-${endTime}`
      : `repeat-${dayOfWeek}-${startTime}-${endTime}`;

    if (seenSchedules.has(key)) {
      return res.status(400).send({
        message: `Failed! Duplicate or overlapping schedule found at ${i + 1}.`
      });
    }

    seenSchedules.add(key);
  }

 */


  next();
}



const verifySpaceActivity = {
   verifySpace : verifySpace,
   verifyActivity : verifyActivity
};

module.exports = verifySpaceActivity;

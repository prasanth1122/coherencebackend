import moment from "moment";

/**
 * Calculates the end date of a subscription.
 * @param {Date} startDate - The start date of the subscription.
 * @param {number} months - The number of months for the subscription duration.
 * @returns {Date} - The calculated end date.
 */
export const calculateEndDate = (startDate, months) => {
  if (!startDate || !months) {
    throw new Error(
      "Both startDate and months are required to calculate end date."
    );
  }

  return moment(startDate).add(months, "months").toDate();
};

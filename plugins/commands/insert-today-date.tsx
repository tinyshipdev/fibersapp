import React from 'react';

interface Props {
  launcher: (handleClick: () => void) => JSX.Element;
  onComplete: (value: string) => void;
}

const InsertTodayDate: React.FC<Props> = ({
  launcher,
  onComplete,
}) => {

  function insertTodayDate() {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    // eventually update this to use the format defined in user config

    return mm + '/' + dd + '/' + yyyy;
  }

  return launcher(() => onComplete(insertTodayDate()))
};

export default {
  id: 'insert-today-date',
  name: `Insert Today's Date`,
  component: InsertTodayDate
}
import React from 'react';

interface InsertTodayDateProps {
  onSelect: (value: string) => void;
}

const InsertTodayDate: React.FC<InsertTodayDateProps> = ({
  onSelect
}) => {

  function insertTodayDate() {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    // eventually update this to use the format defined in user config

    onSelect(mm + '/' + dd + '/' + yyyy);
  }

  return (
    <button onClick={() => insertTodayDate()}>Insert today's date</button>
  );
};

export default InsertTodayDate;
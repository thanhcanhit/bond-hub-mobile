import { CalendarDays } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const DateInput = () => {
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [defaulDOB, setDafaultDOB] = useState(false);
  const showDatePicker = () => {
    setDafaultDOB(true);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  return (
    <View className="w-full items-center flex-row justify-between border border-gray-300 h-16 p-2.5 rounded-lg">
      <TouchableOpacity
        onPress={showDatePicker}
        className="flex-row items-center w-full justify-between"
      >
        <Text className="text-gray-500 text-lg">
          {!defaulDOB ? "Ngày sinh" : date.toLocaleDateString()}
        </Text>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <CalendarDays size={24} color={"gray"} />
      </TouchableOpacity>
    </View>
  );
};

export default DateInput;

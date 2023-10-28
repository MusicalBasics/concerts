import React, { FC } from "react";
import { Text, Rect, Group } from "react-konva";

interface TooltipProps {
  x: number;
  y: number;
  seatNumber: string;
  isReservable?: boolean;
  reservedBy?: string;
  isReserved?: boolean;
  visible: boolean;
}

const Tooltip: FC<TooltipProps> = ({
  x,
  y,
  seatNumber,
  isReservable,
  reservedBy,
  isReserved,
  visible,
}) => {
  if (!visible) return null;

  const tooltipData = [
    { label: "Seat Number:", value: seatNumber },
    {
      label: "Reservable:",
      value: isReservable!.toString(),
    },
    {
      label: "Reserved:",
      value: isReserved!.toString(),
    },
    { label: "Reserved By:", value: (isReserved && reservedBy) || "N/A" },
  ];

  const textHeight = 14;
  const textPadding = 5;
  // Only show the tooltip if there is data to display
  const rectHeight =
    tooltipData.filter((item) => item.value).length * textHeight +
    textPadding * 2;

  return (
    <Group>
      <Rect
        x={x}
        y={y - rectHeight - 10} // Adjust this value to position the tooltip above the seat
        width={350} // Adjust width to accommodate the text
        height={rectHeight}
        fill="black"
        cornerRadius={5}
      />
      {tooltipData.map((item, index) => {
        const { label, value } = item;
        if (!value) return null;
        return (
          <Text
            key={index}
            x={x + textPadding}
            y={y - rectHeight + textPadding + index * textHeight - 10} // Adjust this value to position the text within the tooltip
            text={`${label} ${value}`}
            fontSize={12}
            fill="white"
          />
        );
      })}
    </Group>
  );
};

export default Tooltip;

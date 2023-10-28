import React, { FC, useState } from "react";
import { Group, Rect, Text } from "react-konva";

interface SeatProps {
  x: number;
  y: number;
  width: number;
  height: number;
  isReserved: boolean;
  isReservable: boolean;
  seatNumber: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const Seat: FC<SeatProps> = ({
  x,
  y,
  width = 10,
  height = 15,
  isReserved,
  isReservable,
  seatNumber = "A0",
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  let fill;
  if (isReserved || !isReservable) {
    fill = "grey";
  } else if (isSelected) {
    fill = "blue";
  } else if (isHovered) {
    fill = "green";
  } else {
    fill = "white"; // default color
  }

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={() => {
        onMouseEnter();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        onMouseLeave();
        setIsHovered(false);
      }}
      onTap={() => setIsSelected(!isSelected)}
      onClick={() => setIsSelected(!isSelected)}
    >
      <Rect width={width} height={height} fill={fill} />
      <Text
        text={seatNumber}
        width={width}
        height={height}
        align="center"
        verticalAlign="middle"
        fontSize={10}
        fill="black"
      />
    </Group>
  );
};

export default Seat;

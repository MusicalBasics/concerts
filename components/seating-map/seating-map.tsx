import React, { FC, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Box from "@mui/material/Box";
import Seat from "./seat";
import { Section } from "@/models/section";
import _ from "lodash"; // Import lodash
import Tooltip from "./tooltip";

interface SeatingMapProps {
  sections: Section[];
  curve?: number;
  stageWidthOffset?: number;
  stageRectHeight?: number;
  stageHeightMultiplier?: number;
  rowGap?: number;
  gapBetweenSeats?: number;
}

const SeatingMap: FC<SeatingMapProps> = ({
  sections = [],
  curve = 0.0002,
  stageWidthOffset = 35,
  stageRectHeight = 100,
  stageHeightMultiplier = 1.8,
  rowGap = 8,
  gapBetweenSeats = 5,
}) => {
  const [selectedSeats, setSelectedSeats] = useState({});
  const [hoveredSeat, setHoveredSeat] = useState<string | null | undefined>(
    null
  );
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    seatNumber: string;
    isReservable: boolean;
    reservedBy: string;
    isReserved: boolean;
    visible: boolean;
  } | null>(null);

  const handleMouseEnter = ({
    key,
    seat,
    seatNumber,
    x,
    y,
  }: {
    key: string;
    seat: any;
    seatNumber: string;
    x: number;
    y: number;
  }) => {
    setHoveredSeat(key);
    setTooltip({
      x,
      y,
      seatNumber,
      isReservable: seat.isReservable,
      reservedBy: `${seat.reservedBy?.name} (${seat.reservedBy?.email})`,
      isReserved: seat.isReserved,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setHoveredSeat(null);
    setTooltip(null);
  };

  const rowHeight = 20;
  const seatWidth = 30;
  const gapBetweenSections = seatWidth * 2;

  // Stage
  const getLongestRowWidth = (section: Section) => {
    const longestRow = _.maxBy(section.rows, (row) => row.seats.length);
    return longestRow
      ? longestRow.seats.length * (seatWidth + gapBetweenSeats)
      : 0;
  };
  const stageWidth =
    _.sumBy(sections, getLongestRowWidth) +
    gapBetweenSections * (sections.length - 1);
  const stageHeight = 600;
  const stageRectWidth = stageWidth / 3;
  const stageRectX = (stageWidth - stageRectWidth) / 2; // centering the rectangle
  const stageRectY = 10; // you can adjust this value to position the rectangle

  const getSectionStartX = (sectionIndex: number) => {
    const widthOfPreviousSections =
      _.sumBy(sections.slice(0, sectionIndex), (section) => {
        const longestRow = _.maxBy(section.rows, (row) => row.seats.length);
        return longestRow
          ? longestRow.seats.length * (seatWidth + gapBetweenSeats)
          : 0;
      }) +
      gapBetweenSections * sectionIndex;

    // The starting position of the first section should be 0
    if (sectionIndex === 0) {
      return 0;
    }

    // For other sections, the starting position should be the total width of all previous sections plus the gap between sections
    return widthOfPreviousSections;
  };

  const getLongestRowLength = (section: Section) => {
    const longestRow = _.maxBy(section.rows, (row) => row.seats.length);
    return longestRow ? longestRow.seats.length : 0;
  };

  const getSeatPosition = (
    rowIndex: number,
    seatIndex: number,
    sectionIndex: number
  ) => {
    const sectionStartX = getSectionStartX(sectionIndex);
    const longestRowLength = getLongestRowLength(sections[sectionIndex]);
    const currentRowLength = sections[sectionIndex].rows[rowIndex].seats.length;

    let offset = 0;
    if (sectionIndex === 0) {
      // Right align the first section
      offset =
        (longestRowLength - currentRowLength) * (seatWidth + gapBetweenSeats);
    } else if (sectionIndex === sections.length - 1) {
      // Left align the last section
      offset = 0;
    } else {
      // Center align the middle sections
      offset =
        ((longestRowLength - currentRowLength) *
          (seatWidth + gapBetweenSeats)) /
        2;
    }

    const x =
      sectionStartX + seatIndex * (seatWidth + gapBetweenSeats) + offset;

    const a = curve;
    // Adjust the parabola to ensure it's centered vertically on the stage
    const parabolaHeight = stageRectHeight * stageHeightMultiplier; // Adjust this value to control the height of the parabola
    const parabolaY =
      -a * Math.pow(x - (stageWidth - stageWidthOffset) / 2, 2) +
      parabolaHeight;

    // Adjust the linear part to control the vertical position of the seats within each row
    const linearY = rowIndex * (rowHeight + rowGap);

    // Combine the parabolic and linear parts
    const y = parabolaY + linearY;

    return { x, y };
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: stageWidth,
        height: stageHeight,
      }}
    >
      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          {/* Drawing the stage rectangle */}
          <Rect
            x={stageRectX}
            y={stageRectY}
            width={stageRectWidth}
            height={stageRectHeight}
            fill="grey" // you can change the color
            stroke="black" // adding a border
            strokeWidth={2}
          />
          {sections.map((section, sectionIndex) =>
            section.rows.map((row, rowIndex) =>
              row.seats.map((seat, seatIndex) => {
                const seatNumber = `${row.id}${seat.number}`;
                const key = `${section.sectionName}-${seatNumber}`;
                const { x, y } = getSeatPosition(
                  rowIndex,
                  seatIndex,
                  sectionIndex
                );
                return (
                  <Seat
                    key={key}
                    x={x}
                    y={y}
                    width={seatWidth}
                    height={rowHeight}
                    isReserved={seat.isReserved}
                    isReservable={seat.isReservable}
                    seatNumber={seatNumber}
                    onMouseEnter={() =>
                      handleMouseEnter({ key, seat, seatNumber, x, y })
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            )
          )}
          {tooltip && <Tooltip {...tooltip} />}
        </Layer>
      </Stage>
    </Box>
  );
};

export default SeatingMap;

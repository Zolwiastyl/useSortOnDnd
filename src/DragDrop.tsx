import { Identifier } from "dnd-core";
import { ReactNode, useRef } from "react";
import { useDrop, useDrag, DragSourceMonitor } from "react-dnd";
import { useSortOnDnd } from "./useSortOnDnd";

type MinimalSortableType = { id: string | number };
export const useSimpleDndSort = <T extends MinimalSortableType>(
  items: T[],
  setItems: (s: T[]) => void
) => {
  const { moveItem } = useSortOnDnd(items, setItems);

  return { moveItem };
};

export const SimpleDndSortElement = <T extends MinimalSortableType>(props: {
  item: T;
  index: number;
  children: ReactNode;
  elementName: string;
  onDrag: (dragId: T["id"], hoverId: T["id"]) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    MinimalSortableType & { index: number },
    void,
    { handlerId: Identifier | null }
  >({
    accept: props.elementName,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(hoveredItem, monitor) {
      console.log("hovering");
      if (!ref.current) {
        return;
      }
      console.log("there is ref.current");
      console.log(props.item, "item");
      const dragIndex = hoveredItem.index;
      const hoverIndex = props.index;
      console.log(dragIndex, hoverIndex, "dragIndex, hoverIndex");

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      console.log("dragIndex !== hoverIndex");

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      console.log("going to moveTag");

      // Time to actually perform the action
      props.onDrag(props.item.id, hoveredItem.id);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // item.index = hoverIndex
    },
  });

  const [{ isDragging }, drag] = useDrag({
    canDrag: () => true,
    type: props.elementName,
    item: () => ({ id: props.item.id, index: props.index }),
    collect: (
      monitor: DragSourceMonitor<{ id: string | number; index: number }>
    ) => ({
      isDragging: monitor.getItem()?.id === props.item.id,
    }),
  });

  drag(drop(ref));
  return (
    <div
      data-handler-id={handlerId}
      style={isDragging ? { opacity: "0.6" } : {}}
      ref={ref}
    >
      {props.children}
    </div>
  );
};

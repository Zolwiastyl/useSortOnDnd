type MinimalSortableType = { id: string | number };
export const useSortOnDnd = <T extends MinimalSortableType>(
  selectedActions: T[],
  updateAction: (value: T[]) => void
) => {
  const moveItem = (dragId: T["id"], hoverId: T["id"]) => {
    sortItems(dragId, hoverId, updateAction, selectedActions);
  };

  return { moveItem };
};

// This type should be unified with that on TagButton
// Because weight and index are the same thing
function sortItems<T extends { id: string | number }>(
  dragId: T["id"],
  hoverId: T["id"],
  updateAction: (value: T[]) => void,
  selectedActions: T[]
) {
  const currentList = selectedActions || [];

  const prevWithRanks = currentList.map((el, index) => ({
    ...el,
    rank: index + 1,
  }));
  console.log(prevWithRanks);
  console.log("ids: ", dragId, hoverId);
  const { hoveredElement, draggedElement } = findElements(prevWithRanks, {
    hoverId,
    dragId,
  });
  console.log("found elements: ", hoveredElement, draggedElement);
  // That's just for TS safety
  if (!hoveredElement || !draggedElement) return updateAction(currentList);

  const hoverIndex = hoveredElement.rank;
  const dragIndex = draggedElement.rank;
  console.log("indexes: ", dragIndex, hoverIndex, "ids: ", dragId, hoverId);

  const newSortedList = prevWithRanks
    // decide is should get rank bigger or smaller than current
    // but not the same as adjacent element
    ?.map((el) =>
      el.id === hoverId
        ? { ...el, rank: hoverIndex + (hoverIndex > dragIndex ? -0.5 : 0.5) }
        : el
    )
    .map((el) => (el.id === dragId ? { ...el, rank: hoverIndex } : el))
    // sort by current rank that includes x.5 values from map above
    .sort((x, y) => x.rank - y.rank)
    // replace floats with integers
    .map((el, index) => ({ ...el, rank: index }));

  // Just for TS to ignore the rank field

  return updateAction(newSortedList as unknown as T[]);
}

const findElement = <T extends MinimalSortableType>(
  listOfElements: T[],
  searchedId: string | number
) => listOfElements.find((c) => c.id === searchedId);

const findElements = <T extends MinimalSortableType>(
  listOfElements: T[],
  ids: { dragId: string | number; hoverId: string | number }
) => ({
  draggedElement: findElement(listOfElements, ids.dragId),
  hoveredElement: findElement(listOfElements, ids.hoverId),
});

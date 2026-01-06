const DataTable = ({
  columns,
  data,
  renderRow,
  emptyMessage = "No data found",
  pagination,
}) => {
  return (
    <div className="ui-card">
      <div className="ui-table-wrapper">
        <table className="ui-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="ui-th">
                  {col.renderHeader ? col.renderHeader() : col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map(renderRow)
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <p className="text-slate-500 text-lg">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination}
    </div>
  );
};

export default DataTable;

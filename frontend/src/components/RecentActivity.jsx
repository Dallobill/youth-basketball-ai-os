import { formatDate } from '../utils';

export default function RecentActivity({ evaluations, aiReports }) {
  return (
    <div className="activity-grid">
      <div className="panel">
        <div className="panel-header compact">
          <div>
            <div className="eyebrow">Recent evaluations</div>
            <h2>Latest activity</h2>
          </div>
        </div>
        <div className="stack-list">
          {evaluations.length ? (
            evaluations.map((evaluation) => (
              <div key={evaluation.id} className="stack-row">
                <div>
                  <strong>
                    {evaluation.playerName || 'Player evaluation'}
                  </strong>
                  <p>{evaluation.evaluationType}</p>
                </div>
                <span>
                  {formatDate(evaluation.createdAt || evaluation.created_at)}
                </span>
              </div>
            ))
          ) : (
            <p className="muted-text">No activity loaded yet.</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header compact">
          <div>
            <div className="eyebrow">AI reports</div>
            <h2>Recent outputs</h2>
          </div>
        </div>
        <div className="stack-list">
          {aiReports.length ? (
            aiReports.map((report) => (
              <div key={report.id} className="stack-row vertical">
                <strong>{report.headline}</strong>
                <p>{report.content}</p>
              </div>
            ))
          ) : (
            <p className="muted-text">
              AI outputs will appear here after coach submissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

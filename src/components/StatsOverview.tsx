import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, FileCheck } from "lucide-react";
import { ConsentRequest } from "@/pages/Index";

interface StatsOverviewProps {
  consents: ConsentRequest[];
}

const StatsOverview = ({ consents }: StatsOverviewProps) => {
  const stats = {
    total: consents.length,
    approved: consents.filter((c) => c.status === "approved").length,
    pending: consents.filter((c) => c.status === "pending").length,
    rejected: consents.filter((c) => c.status === "rejected").length,
  };

  const statCards = [
    {
      title: "Total de Manifestações",
      value: stats.total,
      icon: FileCheck,
      color: "from-primary to-primary-light",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Aprovadas",
      value: stats.approved,
      icon: CheckCircle2,
      color: "from-success to-success",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "from-warning to-warning",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      title: "Negadas",
      value: stats.rejected,
      icon: XCircle,
      color: "from-destructive to-destructive",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card
          key={stat.title}
          className="group overflow-hidden p-6 transition-all hover:shadow-lg"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div className={`rounded-lg p-3 transition-transform group-hover:scale-110 ${stat.iconBg}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full bg-gradient-to-r ${stat.color} transition-all`}
              style={{ width: `${stats.total > 0 ? (stat.value / stats.total) * 100 : 0}%` }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;

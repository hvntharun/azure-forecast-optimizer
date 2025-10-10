import { useNavigate } from "react-router-dom";
import { Cloud, Database, HardDrive, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const dashboardOptions = [
  {
    id: "azure-vm",
    title: "Azure VM",
    description: "Monitor and optimize your Azure Virtual Machine costs and reservations",
    icon: Cloud,
    gradient: "from-primary/20 via-accent/10 to-primary/5",
    iconColor: "text-primary",
    route: "/dashboard/azure-vm"
  },
  {
    id: "databricks",
    title: "Databricks",
    description: "Track Databricks usage, costs, and optimization opportunities",
    icon: Database,
    gradient: "from-accent/20 via-primary/10 to-accent/5",
    iconColor: "text-accent",
    route: "/dashboard/databricks"
  },
  {
    id: "azure-storage",
    title: "Storage",
    description: "Analyze storage costs, usage patterns, and savings potential",
    icon: HardDrive,
    gradient: "from-primary/15 via-accent/15 to-primary/10",
    iconColor: "text-primary",
    route: "/dashboard/azure-storage"
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cloud Cost Insights & Forecasting
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {dashboardOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(option.route)}
              className="group cursor-pointer"
            >
              <div className={`relative h-full p-8 rounded-2xl border border-border/50 bg-gradient-to-br ${option.gradient} glass-effect transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1`}>
                {/* Icon */}
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-card to-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <option.icon className={`w-8 h-8 ${option.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {option.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {option.description}
                </p>

                {/* CTA */}
                <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>View Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 p-8 rounded-2xl border border-border/50 glass-effect"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-primary mb-2">€127K</p>
            <p className="text-sm text-muted-foreground">Total Monthly Spend</p>
          </div>
          <div className="text-center border-x border-border/50">
            <p className="text-3xl font-bold text-accent mb-2">€38K</p>
            <p className="text-sm text-muted-foreground">Potential Savings</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success mb-2">30%</p>
            <p className="text-sm text-muted-foreground">Optimization Rate</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

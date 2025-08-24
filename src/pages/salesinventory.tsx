import { useState, type FC, type ReactNode } from "react";

const ChartBarIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ClipboardListIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const StarIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M17 3l-1.17.585A2 2 0 0115 5.172V17a2 2 0 002 2h2a2 2 0 002-2V5.172a2 2 0 01-.83-.586L17 3z" /></svg>;
const TruckIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

type ConsolidatedSale = { id: number; branch: string; amount: number; };
type BranchSale = { id: number; product: string; quantity: number; amount: number; };
type SalesData = { consolidated: ConsolidatedSale[]; "Branch A": BranchSale[]; "Branch B": BranchSale[]; "Branch C": BranchSale[]; };
type InventoryItem = { id: number; product: string; stock: number; status: "In Stock" | "Low Stock" | "Out of Stock"; };
type Product = { id: number; name: string; category: "Coffee" | "Bread"; price: number; image: string; description: string; };
type AssetItem = { id: number; name: string; branch: string; condition: string; status: "In Use" | "In Repair" | "Out of Service"; };
type ReportType = "Daily Sales" | "Inventory" | "Our Products" | "Asset";

const salesData: SalesData = {
  consolidated: [ { id: 1, branch: "Branch A", amount: 5000 }, { id: 2, branch: "Branch B", amount: 7500 }, { id: 3, branch: "Branch C", amount: 3200 }, ],
  "Branch A": [ { id: 1, product: "Espresso", quantity: 100, amount: 2000 }, { id: 2, product: "Croissant", quantity: 50, amount: 1500 }, { id: 3, product: "Latte", quantity: 80, amount: 1500 }, ],
  "Branch B": [ { id: 1, product: "Cappuccino", quantity: 120, amount: 3000 }, { id: 2, product: "Sourdough", quantity: 60, amount: 2000 }, { id: 3, product: "Americano", quantity: 90, amount: 2500 }, ],
  "Branch C": [ { id: 1, product: "Baguette", quantity: 40, amount: 1200 }, { id: 2, product: "Mocha", quantity: 70, amount: 1000 }, { id: 3, product: "Muffin", quantity: 30, amount: 1000 }, ],
};
const inventoryData: InventoryItem[] = [ { id: 1, product: "Espresso Beans", stock: 150, status: "In Stock" }, { id: 2, product: "Croissant Dough", stock: 25, status: "Low Stock" }, { id: 3, product: "Milk", stock: 50, status: "In Stock" }, { id: 4, product: "Sourdough Starter", stock: 0, status: "Out of Stock" }, { id: 5, product: "Chocolate Syrup", stock: 15, status: "Low Stock" }, ];
const productsData: Product[] = [
    { id: 1, name: "Espresso", category: "Coffee", price: 90, image: "/Espresso.png", description: "A concentrated coffee beverage brewed by forcing a small amount of nearly boiling water under pressure through finely-ground coffee beans." },
    { id: 2, name: "Americano", category: "Coffee", price: 100, image: "/hot americano.png", description: "A classic coffee drink made by diluting an espresso with hot water, giving it a similar strength to, but different flavor from, traditionally brewed coffee." },
    { id: 3, name: "Cappuccino", category: "Coffee", price: 120, image: "/CAPPUCCINO.png", description: "An espresso-based coffee drink that originated in Italy, prepared with steamed milk foam. The perfect balance of coffee and milk." },
    { id: 4, name: "Latte", category: "Coffee", price: 130, image: "/Hot Latte.png", description: "A coffee drink made with espresso and steamed milk, creamier than a cappuccino." },
    { id: 5, name: "Flat White", category: "Coffee", price: 135, image: "/Hot Flat White.png", description: "An espresso-based coffee drink with steamed milk, originating from Australia and New Zealand. It is similar to a latte but with a higher proportion of coffee to milk." },
    { id: 6, name: "Mocha", category: "Coffee", price: 140, image: "/Hot Mocha.png", description: "A delicious blend of espresso, steamed milk, and chocolate syrup, topped with whipped cream." },
    { id: 7, name: "Caramel Macchiato", category: "Coffee", price: 150, image: "/Hot Caramel Macchiato.png", description: "A sweet and creamy coffee drink with layers of steamed milk, vanilla syrup, espresso, and a drizzle of caramel sauce." },
    { id: 8, name: "Spanish Latte", category: "Coffee", price: 160, image: "/Hot Spanish Latte.png", description: "A delightful coffee drink made with espresso, steamed milk, and sweetened condensed milk for a rich, creamy texture." },
    { id: 9, name: "Hazelnut Latte", category: "Coffee", price: 150, image: "/Hot Hazelnut Latte.png", description: "A classic latte with a nutty twist. Espresso, steamed milk, and hazelnut syrup." },
    { id: 10, name: "Vanilla Latte", category: "Coffee", price: 150, image: "/Hot Vanilla Latte.png", description: "A smooth and creamy latte flavored with sweet vanilla syrup." },
    { id: 11, name: "Cold Brew", category: "Coffee", price: 120, image: "/Cold Brew.png", description: "Coffee steeped in cold water for an extended period, resulting in a smooth, low-acid, and highly caffeinated coffee concentrate." },
    { id: 12, name: "Iced Americano", category: "Coffee", price: 110, image: "/Iced Americano.png", description: "Espresso shots topped with cold water and served over ice. A refreshing and bold coffee experience." },
    { id: 13, name: "Iced Latte", category: "Coffee", price: 130, image: "/Iced Latte.png", description: "A chilled coffee drink made with espresso, cold milk, and served over ice." },
    { id: 14, name: "Iced Caramel Macchiato", category: "Coffee", price: 140, image: "/Iced White Mochs.png", description: "A cold version of the classic, with layers of vanilla syrup, cold milk, espresso, and caramel drizzle over ice." },
    { id: 15, name: "Iced White Mocha", category: "Coffee", price: 155, image: "/Iced Caramel Macchiato.png", description: "A sweet and creamy iced coffee drink made with espresso, milk, and white chocolate sauce." },
    { id: 16, name: "Iced Matcha Latte", category: "Coffee", price: 160, image: "/Iced Matcha Latte.png", description: "A refreshing blend of finely ground green tea powder, milk, and a sweetener, served over ice." },
    { id: 17, name: "Ensaymada", category: "Bread", price: 35, image: "/BREAD.png", description: "A soft, sweet brioche pastry covered with butter, sugar, and grated cheese. A Filipino classic." },
    { id: 18, name: "Spanish Bread", category: "Bread", price: 20, image: "/Spanish Bread (1).png", description: "A soft bread roll with a sweet, buttery filling, rolled in breadcrumbs before baking." },
    { id: 19, name: "Cheese Roll", category: "Bread", price: 25, image: "/Cheese Roll.png", description: "A soft, fluffy bread roll with a savory cheese filling, often topped with more cheese." },
    { id: 20, name: "Croissant", category: "Bread", price: 55, image: "/Croissant.png", description: "A buttery, flaky, and crescent-shaped pastry of Austrian origin, named for its historical crescent shape." },
    { id: 21, name: "Chocolate Croissant", category: "Bread", price: 65, image: "/Choco Croissant.png", description: "A classic croissant with a piece of dark chocolate baked inside." },
    { id: 22, name: "Cinnamon Roll", category: "Bread", price: 85, image: "/Cinammon Roll.png", description: "A sweet baked dough filled with a cinnamon-sugar mixture, often topped with a cream cheese frosting." },
    { id: 23, name: "Banana Bread Slice", category: "Bread", price: 45, image: "/Banana Bread Slice.png", description: "A moist and sweet cake-like bread made from mashed bananas." },
    { id: 24, name: "Chocolate Chip Cookie", category: "Bread", price: 40, image: "/COOKIES.png", description: "A classic cookie with a soft and chewy texture, loaded with semi-sweet chocolate chips." },
    { id: 25, name: "Double Chocolate Cookie", category: "Bread", price: 45, image: "/choco cookie.png", description: "A rich, chocolate-based cookie packed with even more chocolate chips for the ultimate chocolate lover." },
    { id: 26, name: "Oatmeal Raisin Cookie", category: "Bread", price: 35, image: "/Oatmeal Raisin Cookie.png", description: "A chewy cookie made with rolled oats, sweet raisins, and a hint of cinnamon." },
    { id: 27, name: "Peanut Butter Cookie", category: "Bread", price: 40, image: "/Peanut Butter Cookie.png", description: "A soft and crumbly cookie with a rich peanut butter flavor, often with a criss-cross pattern on top." },
    { id: 28, name: "White Chocolate Macadamia Cookie", category: "Bread", price: 50, image: "/white cookie.png", description: "A delicious cookie loaded with creamy white chocolate chunks and crunchy macadamia nuts." },
];
const assetData: AssetItem[] = [ { id: 1, name: "Espresso Machine", branch: "Branch A", condition: "Good", status: "In Use" }, { id: 2, name: "Oven", branch: "Branch B", condition: "Excellent", status: "In Use" }, { id: 3, name: "Delivery Van", branch: "Consolidated", condition: "Fair", status: "In Repair" }, { id: 4, name: "POS System", branch: "Branch C", condition: "Good", status: "In Use" }, ];

const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const PageHeader: FC<{ title: string; children?: ReactNode; }> = ({ title, children }) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
    <h1 className="text-3xl font-bold text-[#6a554b] mb-4 sm:mb-0">{title}</h1>
    <div>{children}</div>
  </div>
);

const Sidebar: FC<{ onSelectReport: (report: ReportType) => void }> = ({ onSelectReport }) => {
    const [activeReport, setActiveReport] = useState<ReportType>("Daily Sales");
    const menuItems: { name: ReportType; icon: ReactNode }[] = [
        { name: "Daily Sales", icon: <ChartBarIcon /> },
        { name: "Inventory", icon: <ClipboardListIcon /> },
        { name: "Our Products", icon: <StarIcon /> },
        { name: "Asset", icon: <TruckIcon /> },
    ];

    const handleReportClick = (report: ReportType) => {
        setActiveReport(report);
        onSelectReport(report);
    };

    return (
        <div className="w-64 bg-[#3D2C1D] text-white h-screen p-4 flex-shrink-0 flex flex-col">
            <img src="/logo.png" alt="Company Logo" className="w-32 mb-10 self-center" />
            <nav>
                <ul>
                    {menuItems.map(({ name, icon }) => (
                        <li key={name}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleReportClick(name); }}
                                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#4b3832] focus:ring-white ${activeReport === name ? "bg-[#be9b7b] text-white font-semibold" : "text-gray-300 hover:bg-[#6a554b] hover:text-white"}`}
                            >
                                {icon}
                                {name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

const DailySalesReport: FC = () => {
    const [selectedBranch, setSelectedBranch] = useState<keyof SalesData>("consolidated");
    const currentData = salesData[selectedBranch];
    const maxAmount = Math.max(...currentData.map((item) => item.amount), 0);
  
    return (
        <div className="p-8">
            <PageHeader title="Daily Sales Report">
                <select
                    className="bg-white border border-gray-300 rounded-md py-2 px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#6a554b]"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value as keyof SalesData)}
                >
                    <option value="consolidated">Consolidated</option>
                    <option value="Branch A">Branch A</option>
                    <option value="Branch B">Branch B</option>
                    <option value="Branch C">Branch C</option>
                </select>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-[#6a554b]">
                        {selectedBranch === "consolidated" ? "Consolidated Sales" : `Sales for ${selectedBranch}`}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-2 pr-4 font-semibold text-gray-600 uppercase">{selectedBranch === "consolidated" ? "Branch" : "Product"}</th>
                                    <th className="py-2 pl-4 font-semibold text-gray-600 uppercase text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map(item => {
                                    const isConsolidated = "branch" in item;
                                    return (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 pr-4">{isConsolidated ? (item as ConsolidatedSale).branch : (item as BranchSale).product}</td>
                                            <td className="py-3 pl-4 text-right font-medium">₱{item.amount.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="lg:col-span-3">
                    <h2 className="text-xl font-semibold mb-4 text-[#6a554b]">Sales Visualization</h2>
                    <div className="h-80 flex items-end justify-around space-x-4 pt-4">
                        {currentData.map(item => (
                            <div key={item.id} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-full bg-[#c8b7a6] rounded-t-md transition-all duration-500"
                                    style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                                />
                                <span className="text-xs mt-2 text-gray-500 text-center">
                                    {"branch" in item ? (item as ConsolidatedSale).branch : (item as BranchSale).product}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const InventoryReport: FC = () => {
    const getStatusClass = (status: InventoryItem["status"]) => ({
        "In Stock": "bg-green-100 text-green-800",
        "Low Stock": "bg-yellow-100 text-yellow-800",
        "Out of Stock": "bg-red-100 text-red-800",
    }[status]);

    return (
        <div className="p-8">
            <PageHeader title="Inventory Report" />
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="py-3 pr-4 font-semibold text-gray-600 uppercase">Product</th>
                                <th className="py-3 px-4 font-semibold text-gray-600 uppercase">Stock</th>
                                <th className="py-3 pl-4 font-semibold text-gray-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 pr-4 whitespace-nowrap">{item.product}</td>
                                    <td className="py-3 px-4">{item.stock}</td>
                                    <td className="py-3 pl-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const ProductList: FC = () => (
    <div className="p-8">
      <PageHeader title="Top-Selling Products" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productsData.map((product) => (
          <div key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <img className="w-full h-48 object-cover" src={product.image} alt={product.name} />
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-xs text-gray-500 uppercase">{product.category}</p>
              <h3 className="text-lg font-bold text-[#4b3832] mt-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-2 flex-grow">{product.description}</p>
              <div className="mt-4 text-right">
                <p className="text-xl font-bold text-[#be9b7b]">₱{product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

const AssetReport: FC = () => (
    <div className="p-8">
        <PageHeader title="Asset Report" />
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="py-3 pr-4 font-semibold text-gray-600 uppercase">Asset Name</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 uppercase">Branch</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 uppercase">Condition</th>
                            <th className="py-3 pl-4 font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assetData.map((asset) => (
                            <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 pr-4 whitespace-nowrap">{asset.name}</td>
                                <td className="py-3 px-4">{asset.branch}</td>
                                <td className="py-3 px-4">{asset.condition}</td>
                                <td className="py-3 pl-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        asset.status === "In Use" ? "bg-green-100 text-green-800"
                                        : asset.status === "In Repair" ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                        {asset.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

const Dashboard: FC = () => {
    const [selectedReport, setSelectedReport] = useState<ReportType>("Daily Sales");

    const renderReport = () => {
        switch (selectedReport) {
            case "Daily Sales": return <DailySalesReport />;
            case "Inventory": return <InventoryReport />;
            case "Our Products": return <ProductList />;
            case "Asset": return <AssetReport />;
            default: return <DailySalesReport />;
        }
    };

    return (
        <div className="flex h-screen bg-[#fbf9f6] text-gray-800">
            <Sidebar onSelectReport={setSelectedReport} />
            <main className="flex-1 overflow-y-auto">
                {renderReport()}
            </main>
        </div>
    );
};

export default Dashboard;
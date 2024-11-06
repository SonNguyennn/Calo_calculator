import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Typography, Card, Layout, Space, Image } from 'antd';
import { Pie } from 'react-chartjs-2';
import { FacebookOutlined } from '@ant-design/icons';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, ChartData } from 'chart.js';
import logo from './assets/logo.png';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;
const { Footer } = Layout;

function CalorieCalculator() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [frequency, setFrequency] = useState('');
    const [calories, setCalories] = useState(null);
    const [barsPerDay, setBarsPerDay] = useState(null);
    const [barsPerMonth, setBarsPerMonth] = useState(null);

    const caloriesPerBar = 100;

    const calculateCalories = () => {
        const weightFactor = 10 * parseFloat(weight);
        const heightFactor = 6.25 * parseFloat(height);
        const ageFactor = 5 * parseFloat(age);

        const bmr = weightFactor + heightFactor - ageFactor + 5;

        // Kiểm tra BMR hợp lệ
        if (bmr <= 0) {
            alert("BMR tính toán không hợp lệ, vui lòng kiểm tra lại giá trị nhập vào.");
            return;
        }

        let dailyCalories = 0;
        // Tính calo cần thiết mỗi ngày dựa trên mức độ hoạt động
        switch (frequency) {
            case 'low':
                dailyCalories = bmr * 1.2;
                break;
            case 'light':
                dailyCalories = bmr * 1.375;
                break;
            case 'moderate':
                dailyCalories = bmr * 1.55;
                break;
            case 'active':
                dailyCalories = bmr * 1.725;
                break;
            case 'veryActive':
                dailyCalories = bmr * 1.9;
                break;
            default:
                dailyCalories = bmr * 1.2;
        }

        // Khuyến nghị số thanh dinh dưỡng, với mỗi thanh là 150 calo
        const barsPerDay = dailyCalories / 150;  // 1 thanh dinh dưỡng = 150 calo
        const barsPerMonth = barsPerDay * 30; // Khuyến nghị mỗi tháng

        setCalories(dailyCalories);
        setBarsPerDay(barsPerDay.toFixed(1));  // Số thanh dinh dưỡng mỗi ngày
        setBarsPerMonth(barsPerMonth.toFixed(0)); // Số thanh dinh dưỡng mỗi tháng
    };


    const handleSubmit = (values) => {
        setName(values.name);
        setAge(values.age);
        setWeight(values.weight);
        setHeight(values.height);
        setFrequency(values.frequency);

        calculateCalories();
    };

    const pieData = {
        labels: ['Lượng calo thực tế', 'Calo còn lại', 'Calo khuyến nghị'],
        datasets: [
            {
                label: 'Calo',
                data: [calories, Math.max(2500 - calories, 0), 2500],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Custom plugin to display calorie numbers on the pie chart
    const plugin = {
        id: 'custom_text_plugin',
        afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            const dataset = data.datasets[0];

            dataset.data.forEach((value, index) => {
                const meta = chart.getDatasetMeta(0);
                const arc = meta.data[index];

                if (arc.hidden) return;

                const { x, y, radius } = arc.tooltipPosition();
                const angle = arc.startAngle + (arc.endAngle - arc.startAngle) / 2;
                const xPosition = x + Math.cos(angle) * radius * 0.6;
                const yPosition = y + Math.sin(angle) * radius * 0.6;

                ctx.fillStyle = '#fff'; // Màu chữ
                ctx.font = 'bold 14px Arial'; // Kích thước chữ
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toFixed(0), xPosition, yPosition);
            });
        },
    };

    return (
        <div style={{ textAlign: "center", paddingBottom: "50px", backgroundColor: '#fff8e1' }}>
            <Image
                src={logo}
                alt="Logo nhóm"
                style={{ width: '200px' }}
            />
            <AntTitle level={2}>Calo Calculator</AntTitle>
            <Card style={{ maxWidth: "500px", margin: "auto", padding: "20px", borderRadius: "8px" }}>
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tuổi" name="age" rules={[{ required: true, message: 'Vui lòng nhập tuổi của bạn' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} onChange={(value) => setAge(value)} />
                    </Form.Item>
                    <Form.Item label="Cân nặng (kg)" name="weight" rules={[{ required: true, message: 'Vui lòng nhập cân nặng của bạn' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} onChange={(value) => setWeight(value)} />
                    </Form.Item>
                    <Form.Item label="Chiều cao (cm)" name="height" rules={[{ required: true, message: 'Vui lòng nhập chiều cao của bạn' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} onChange={(value) => setHeight(value)} />
                    </Form.Item>
                    <Form.Item label="Mức độ hoạt động thể chất" name="frequency">
                        <Select onChange={(value) => setFrequency(value)}>
                            <Option value="low">Ít hoặc không tập thể dục</Option>
                            <Option value="light">Tập thể dục nhẹ (1-3 ngày/tuần)</Option>
                            <Option value="moderate">Tập thể dục vừa phải (3-5 ngày/tuần)</Option>
                            <Option value="active">Tập thể dục nhiều (6-7 ngày/tuần)</Option>
                            <Option value="veryActive">Tập thể dục rất nhiều (2 lần/ngày hoặc công việc nặng)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Tính toán Calo</Button>
                    </Form.Item>
                </Form>

            </Card>

            {calories && (
                <div style={{ marginTop: "20px", maxWidth: "700px", margin: "auto" }}>
                    <Pie data={pieData} options={{
                        plugins: [plugin],
                        responsive: true,
                        maintainAspectRatio: false,
                        aspectRatio: 1,
                    }} height={300} width={300} />
                </div>
            )}

            {barsPerDay && barsPerMonth && (
                <div style={{ marginTop: "20px" }}>
                    <Text style={{ fontSize: '20px' }}>
                        Dựa trên nhu cầu calo hàng ngày của bạn, chúng tôi khuyến nghị bạn tiêu thụ khoảng <strong>{barsPerDay} thanh dinh dưỡng mỗi ngày</strong>.<br />
                        Điều này sẽ tương đương với <strong>{barsPerMonth} thanh dinh dưỡng mỗi tháng</strong>.
                    </Text><br />
                    <Text style={{
                        fontSize: '16px',
                        color: "#6d6d6d",
                        marginBottom: '20px',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflow: 'hidden'
                    }}>
                        Việc tính calo này giúp bạn có thể tính toán ước lượng calo mà bạn có thể tiêu thụ trong ngày dựa trên những thông tin bạn cung cấp. Việc khuyến nghị bạn ăn bao nhiêu thanh dinh dưỡng cũng hoàn toàn dựa trên lượng calo bạn có thể tiêu thụ, bạn có thể dùng ít hơn để có thể đảm bảo lượng dinh dưỡng cho các bữa ăn khác trong ngày.
                    </Text>
                </div>
            )}

            <Footer style={{ textAlign: 'center', marginTop: "20px" }}>
                <Text>© 2024 by DynamiX. All rights reserved.</Text><br />
                <a href="https://www.facebook.com/profile.php?id=61568361595716" target="_blank" rel="noopener noreferrer">
                    <FacebookOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                    Visit our Fanpage
                </a>
            </Footer>
        </div>
    );
}

export default CalorieCalculator;

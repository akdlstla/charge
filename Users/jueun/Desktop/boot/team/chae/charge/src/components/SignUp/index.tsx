import React, { useState } from 'react';
import styles from './SignUp.module.css';
import type { CascaderProps } from 'antd';
import {
    AutoComplete,
    Button,
    Cascader,
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Modal,
    Space,
} from 'antd';
import axios from 'axios';
import Router, { useRouter } from 'next/router';
const { Option } = Select;
import DaumPostcode from 'react-daum-postcode';

interface DataNodeType {
    value: string;
    label: string;
    children?: DataNodeType[];
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};

const SignUp: React.FC = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [address, setAddress] = useState<string>('');

    const onFinish = async (values: any) => {
        console.log('Received values of form: ', values);
        try {
            const response = await axios.post('http://localhost:5005/api/sign', {
                id: values.id,
                password: values.password,
                name: values.name,
                residence: values.residence,
                phone: values.phone,
            });
            console.log('성공:', response.data);
            setErrorMessage(''); // 성공 시 에러 메시지 초기화
            Router.push('/');
        } catch (err) {
            console.log('실패:', err);
            if (axios.isAxiosError(err) && err.response) {
                setErrorMessage(err.response.data.message || '회원가입에 실패했습니다.');
            } else {
                setErrorMessage('알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    const [autoCompleteResult, setAutoCompleteResult] = useState<string[]>([]);

    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        console.log(fullAddress); // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
        form.setFieldsValue({ residence: fullAddress });
        setAddress(fullAddress);
        setIsModalVisible(false);
    };
    const onWebsiteChange = (value: string) => {
        if (!value) {
            setAutoCompleteResult([]);
        } else {
            setAutoCompleteResult(['.com', '.org', '.net'].map((domain) => `${value}${domain}`));
        }
    };

    const websiteOptions = autoCompleteResult.map((website) => ({
        label: website,
        value: website,
    }));

    return (
        <Form
            {...formItemLayout}
            form={form}
            name="register"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
            scrollToFirstError
        >
            <Form.Item
                name="id"
                label="아이디"
                rules={[
                    {
                        required: true,
                        message: '이메일을 입력해 주세요',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            {errorMessage && <div style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</div>}
            <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                    {
                        required: true,
                        message: '비밀번호를 입력해 주세요',
                    },
                ]}
                hasFeedback
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="confirm"
                label="비밀번호 확인"
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: '비밀번호를 다시 입력해 주세요',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('비밀번호가 서로 다릅니다'));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="name"
                label="이름"
                rules={[{ required: true, message: '이름을 작성해 주세요', whitespace: true }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="birthday"
                label="생년월일"
                rules={[{ required: true, message: '생년월일을 입력해 주세요', whitespace: true }]}
            >
                <Input style={{ width: '30%', marginRight: '5px' }} />
                <Input style={{ width: '25%', marginRight: '5px' }} />
                <Input style={{ width: '25%' }} />
            </Form.Item>

            <Form.Item
                name="phone"
                label="핸드폰 번호"
                rules={[{ required: true, message: '핸드폰 번호를 입력해 주세요' }]}
            >
                <Input style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="residence" label="주소" rules={[{ required: true, message: '주소를 입력해 주세요' }]}>
                <Input.Group compact>
                    {' '}
                    <Input value={address} style={{ width: '75%' }} readOnly />{' '}
                    <Button onClick={() => setIsModalVisible(true)}>주소찾기</Button>
                    <Input placeholder="상세 주소를 입력하세요" style={{marginTop:'5px'}}/>
                </Input.Group>
            </Form.Item>

            <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                    {
                        validator: (_, value) =>
                            value ? Promise.resolve() : Promise.reject(new Error('이용약관에 체크해 주세요')),
                    },
                ]}
                {...tailFormItemLayout}
            >
                <Checkbox>
                    <a href="">이용약관</a>을 읽었으며 이에 동의합니다
                </Checkbox>
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    회원가입
                </Button>
            </Form.Item>
            <Modal
                title="주소 검색"
                open={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
            >
                <DaumPostcode onComplete={handleComplete} />
            </Modal>
        </Form>
    );
};

export default SignUp;
